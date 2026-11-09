import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, testFirebaseConnection } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LiveCampusHeader } from './components/LiveCampusHeader';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { RouteModal } from './components/RouteModal';
import { SeatLayoutModal } from './components/SeatLayoutModal';
import { Home } from './pages/Home';
import { RoutesPage } from './pages/RoutesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { DriverPortal } from './pages/DriverPortal';
import { AdminPortal } from './pages/AdminPortal';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './components/AccessDenied';
import { StudentCheckIn } from './components/StudentCheckIn';
import { StudentBoardingPassModal } from './components/StudentBoardingPassModal';
import { AiTransitAssistant } from './components/AiTransitAssistant';
import { PREDEFINED_BUS_ROUTES } from './data/busRoutes';
import { BusRoute, BusTransitStatus, SeatReservation, StudentAttendance } from './types/bus';

function MainApp() {
  const { userProfile, updateRole, canAccessDriverPortal, canAccessAdminPortal } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'home' | 'find' | 'routes' | 'dashboard' | 'about' | 'driver' | 'admin'
  >('home');
  const [buses, setBuses] = useState<BusRoute[]>(PREDEFINED_BUS_ROUTES);
  const [reservations, setReservations] = useState<SeatReservation[]>([]);
  const [attendances, setAttendances] = useState<StudentAttendance[]>([]);
  const [selectedRouteBus, setSelectedRouteBus] = useState<BusRoute | null>(null);
  const [selectedSeatBus, setSelectedSeatBus] = useState<BusRoute | null>(null);
  const [searchedDestination, setSearchedDestination] = useState<string>('');
  const [bookedBuses, setBookedBuses] = useState<string[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isStudentCheckInOpen, setIsStudentCheckInOpen] = useState(false);
  const [selectedBoardingPass, setSelectedBoardingPass] = useState<SeatReservation | null>(null);
  const [isBoardingPassModalOpen, setIsBoardingPassModalOpen] = useState(false);

  const hasSeededRef = useRef(false);

  // Initialize and listen to Firestore
  useEffect(() => {
    testFirebaseConnection();

    // Listen to buses collection
    const unsubscribeBuses = onSnapshot(
      collection(db, 'buses'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedBuses = snapshot.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          })) as BusRoute[];
          // Only update state if data actually changed to avoid re-render loops
          setBuses((prev) => {
            const isSame =
              prev.length === loadedBuses.length &&
              prev.every((b, idx) => {
                const lb = loadedBuses[idx];
                return (
                  lb &&
                  b.id === lb.id &&
                  b.availableSeats === lb.availableSeats &&
                  b.status === lb.status &&
                  b.currentStop === lb.currentStop
                );
              });
            return isSame ? prev : loadedBuses;
          });
        } else if (!hasSeededRef.current) {
          hasSeededRef.current = true;
          // Seed initial buses to Firestore once on clean launch
          PREDEFINED_BUS_ROUTES.forEach(async (bus) => {
            try {
              await setDoc(doc(db, 'buses', bus.id), bus);
            } catch (e) {
              console.warn('Initial seed skipped:', e);
            }
          });
        }
      },
      (err) => {
        console.warn('Firestore buses subscription notice:', err.message);
      }
    );

    // Listen to reservations collection
    const unsubscribeReservations = onSnapshot(
      collection(db, 'reservations'),
      (snapshot) => {
        const loaded = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as SeatReservation[];
        setReservations(loaded);
      },
      (err) => {
        console.warn('Reservations subscription notice:', err.message);
      }
    );

    return () => {
      unsubscribeBuses();
      unsubscribeReservations();
    };
  }, []);

  // Update Bus Transit Status (Driver Action)
  const handleUpdateBusStatus = async (
    busId: string,
    status: BusTransitStatus,
    currentStop?: string
  ) => {
    // Optimistic UI update
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status, currentStop: currentStop || b.currentStop } : b))
    );
    try {
      await updateDoc(doc(db, 'buses', busId), {
        status,
        currentStop: currentStop || '',
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to sync bus status:', e);
    }
  };

  // Update Available Seats (Driver Seat Adjuster)
  const handleUpdateAvailableSeats = async (busId: string, newSeats: number) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, availableSeats: newSeats } : b))
    );
    try {
      await updateDoc(doc(db, 'buses', busId), {
        availableSeats: newSeats,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to sync available seats:', e);
    }
  };

  // Driver checks in student
  const handleCheckInStudent = async (reservationId: string) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked_in', checkedInAt: nowTime } : r))
    );
    setSelectedBoardingPass((prev) =>
      prev && prev.id === reservationId ? { ...prev, status: 'checked_in', checkedInAt: nowTime } : prev
    );
    try {
      await updateDoc(doc(db, 'reservations', reservationId), {
        status: 'checked_in',
        checkedInAt: nowTime,
      });

      // Also record in attendance
      const targetRes = reservations.find((r) => r.id === reservationId);
      if (targetRes) {
        const attId = `att-${targetRes.id}`;
        await setDoc(doc(db, 'attendance', attId), {
          id: attId,
          studentUid: targetRes.userId,
          studentName: targetRes.userName,
          studentEmail: targetRes.userEmail,
          studentId: targetRes.studentId || 'JU24CS089',
          busId: targetRes.busId,
          busNumber: targetRes.busNumber,
          routeName: targetRes.routeName,
          scannedAt: nowTime,
          date: new Date().toLocaleDateString('en-IN'),
          boardingPoint: 'Jain Global Campus (Bay 1-4)',
          status: 'confirmed',
        });
      }
    } catch (e) {
      console.error('Failed to check in student:', e);
    }
  };

  // Admin add bus
  const handleAddBus = async (newBus: BusRoute) => {
    setBuses((prev) => [...prev, newBus]);
    try {
      await setDoc(doc(db, 'buses', newBus.id), newBus);
    } catch (e) {
      console.error('Failed to add bus to Firestore:', e);
    }
  };

  // Admin update bus
  const handleUpdateBus = async (updatedBus: BusRoute) => {
    setBuses((prev) => prev.map((b) => (b.id === updatedBus.id ? updatedBus : b)));
    try {
      await setDoc(doc(db, 'buses', updatedBus.id), updatedBus, { merge: true });
    } catch (e) {
      console.error('Failed to update bus in Firestore:', e);
    }
  };

  // Admin delete bus
  const handleDeleteBus = async (busId: string) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
    try {
      await deleteDoc(doc(db, 'buses', busId));
    } catch (e) {
      console.error('Failed to delete bus from Firestore:', e);
    }
  };

  // Student seat booking toggle
  const handleToggleBookSeat = async (busId: string) => {
    const isBooked = bookedBuses.includes(busId);
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return;

    if (isBooked) {
      // Cancel
      const newSeats = Math.min(bus.totalSeats, bus.availableSeats + 1);
      setBookedBuses((prev) => prev.filter((id) => id !== busId));
      handleUpdateAvailableSeats(busId, newSeats);
      const existingRes = reservations.find(
        (r) => r.busId === busId && (r.userId === userProfile?.uid || r.userEmail === userProfile?.email)
      );
      if (existingRes) {
        setReservations((prev) => prev.filter((r) => r.id !== existingRes.id));
        deleteDoc(doc(db, 'reservations', existingRes.id)).catch(() => {});
      }
    } else {
      // Reserve
      if (bus.availableSeats <= 0) return;
      const newSeats = bus.availableSeats - 1;
      setBookedBuses((prev) => [...prev, busId]);
      handleUpdateAvailableSeats(busId, newSeats);

      // Create reservation record
      const newReservation: SeatReservation = {
        id: `res-${Date.now()}`,
        busId: bus.id,
        busNumber: bus.busNumber,
        routeName: bus.routeName,
        userId: userProfile?.uid || 'guest-student',
        userName: userProfile?.displayName || 'Jain Student',
        userEmail: userProfile?.email || 'student@jainuniversity.ac.in',
        studentId: userProfile?.studentId || 'JU24CS089',
        seatNumber: bus.totalSeats - newSeats,
        destinationStop: searchedDestination || bus.stops[1] || 'City Stop',
        bookingDate: new Date().toLocaleDateString('en-IN'),
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setReservations((prev) => [...prev, newReservation]);
      setSelectedBoardingPass(newReservation);
      setIsBoardingPassModalOpen(true);
      try {
        await setDoc(doc(db, 'reservations', newReservation.id), newReservation);
      } catch (e) {
        console.warn('Local reservation recorded:', e);
      }
    }
  };

  // Pick specific seat number from visual coach diagram
  const handlePickSeatNumber = async (busId: string, seatNumber: number) => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus || bus.availableSeats <= 0) return;

    if (!bookedBuses.includes(busId)) {
      setBookedBuses((prev) => [...prev, busId]);
      const newSeats = Math.max(0, bus.availableSeats - 1);
      handleUpdateAvailableSeats(busId, newSeats);

      const newReservation: SeatReservation = {
        id: `res-${Date.now()}`,
        busId: bus.id,
        busNumber: bus.busNumber,
        routeName: bus.routeName,
        userId: userProfile?.uid || 'guest-student',
        userName: userProfile?.displayName || 'Jain Student',
        userEmail: userProfile?.email || 'student@jainuniversity.ac.in',
        studentId: userProfile?.studentId || 'JU24CS089',
        seatNumber,
        destinationStop: searchedDestination || bus.stops[1] || 'City Stop',
        bookingDate: new Date().toLocaleDateString('en-IN'),
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setReservations((prev) => [...prev, newReservation]);
      setSelectedBoardingPass(newReservation);
      setIsBoardingPassModalOpen(true);
      try {
        await setDoc(doc(db, 'reservations', newReservation.id), newReservation);
      } catch (e) {
        console.warn('Local reservation recorded:', e);
      }
    }
  };

  // Open QR Boarding Pass for a specific bus
  const handleOpenBoardingPassForBus = (busId: string) => {
    const res =
      reservations.find(
        (r) =>
          r.busId === busId &&
          r.status !== 'cancelled' &&
          (r.userId === userProfile?.uid || r.userEmail === userProfile?.email)
      ) ||
      reservations.find((r) => r.busId === busId && r.status !== 'cancelled');

    if (res) {
      setSelectedBoardingPass(res);
      setIsBoardingPassModalOpen(true);
    }
  };

  // Sync selectedBoardingPass with live Firestore reservation state
  useEffect(() => {
    if (selectedBoardingPass) {
      const live = reservations.find((r) => r.id === selectedBoardingPass.id);
      if (live && (live.status !== selectedBoardingPass.status || live.checkedInAt !== selectedBoardingPass.checkedInAt)) {
        setSelectedBoardingPass(live);
      }
    }
  }, [reservations, selectedBoardingPass]);

  // Keep bookedBuses synced with student's active reservations
  useEffect(() => {
    if (reservations.length > 0 && userProfile) {
      const activeIds = reservations
        .filter(
          (r) =>
            r.status !== 'cancelled' &&
            (r.userId === userProfile.uid || r.userEmail === userProfile.email)
        )
        .map((r) => r.busId);
      if (activeIds.length > 0) {
        setBookedBuses((prev) => Array.from(new Set([...prev, ...activeIds])));
      }
    }
  }, [reservations, userProfile]);

  const currentStudentReservations = reservations.filter(
    (r) =>
      (userProfile && (r.userId === userProfile.uid || r.userEmail === userProfile.email)) ||
      r.userId === 'guest-student' ||
      bookedBuses.includes(r.busId)
  );

  const handleNavClick = (
    tab: 'home' | 'find' | 'routes' | 'dashboard' | 'about' | 'driver' | 'admin'
  ) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Mandatory First Screen: If user is not logged in, show LoginPage first
  if (!userProfile) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Real-time date & IST clock header for Jain University */}
      <LiveCampusHeader />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavClick}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        activePassCount={currentStudentReservations.length}
        onOpenActivePass={() => {
          if (currentStudentReservations.length > 0) {
            setSelectedBoardingPass(currentStudentReservations[0]);
            setIsBoardingPassModalOpen(true);
          }
        }}
        onQuickFindClick={() => {
          setActiveTab('home');
          const input = document.getElementById('destination-input');
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' || activeTab === 'find' ? (
          <Home
            buses={buses}
            bookedBuses={bookedBuses}
            onViewRoute={(bus, destination) => {
              if (destination) setSearchedDestination(destination);
              setSelectedRouteBus(bus);
            }}
            onViewSeatMap={(bus) => setSelectedSeatBus(bus)}
            onToggleBookSeat={handleToggleBookSeat}
            onNavigateTab={handleNavClick}
            initialQuery={searchedDestination}
            onUpdateSearchedTerm={setSearchedDestination}
            onOpenCheckIn={() => setIsStudentCheckInOpen(true)}
            userReservations={currentStudentReservations}
            onOpenBoardingPass={(res) => {
              setSelectedBoardingPass(res);
              setIsBoardingPassModalOpen(true);
            }}
            onViewBoardingPassForBus={handleOpenBoardingPassForBus}
          />
        ) : activeTab === 'routes' ? (
          <RoutesPage
            buses={buses}
            bookedBuses={bookedBuses}
            onViewRoute={(bus) => setSelectedRouteBus(bus)}
            onViewSeatMap={(bus) => setSelectedSeatBus(bus)}
            onToggleBookSeat={handleToggleBookSeat}
            onViewBoardingPass={handleOpenBoardingPassForBus}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardPage
            buses={buses}
            onViewRoute={(bus) => setSelectedRouteBus(bus)}
            onViewSeatMap={(bus) => setSelectedSeatBus(bus)}
          />
        ) : activeTab === 'driver' ? (
          canAccessDriverPortal ? (
            <DriverPortal
              buses={buses}
              reservations={reservations}
              onUpdateBusStatus={handleUpdateBusStatus}
              onUpdateAvailableSeats={handleUpdateAvailableSeats}
              onCheckInStudent={handleCheckInStudent}
            />
          ) : (
            <AccessDenied
              requiredRole="driver"
              onNavigateHome={() => setActiveTab('home')}
            />
          )
        ) : activeTab === 'admin' ? (
          canAccessAdminPortal ? (
            <AdminPortal
              buses={buses}
              onAddBus={handleAddBus}
              onUpdateBus={handleUpdateBus}
              onDeleteBus={handleDeleteBus}
            />
          ) : (
            <AccessDenied
              requiredRole="admin"
              onNavigateHome={() => setActiveTab('home')}
            />
          )
        ) : (
          <AboutPage onNavigateTab={handleNavClick} />
        )}
      </main>

      {/* Route & Seat Modals */}
      <RouteModal
        bus={selectedRouteBus}
        searchedDestination={searchedDestination}
        onClose={() => setSelectedRouteBus(null)}
      />

      <SeatLayoutModal
        bus={selectedSeatBus}
        onClose={() => setSelectedSeatBus(null)}
        onBookSeat={handlePickSeatNumber}
      />

      {/* Student Generated QR Boarding Pass Modal */}
      <StudentBoardingPassModal
        reservation={selectedBoardingPass}
        isOpen={isBoardingPassModalOpen}
        onClose={() => setIsBoardingPassModalOpen(false)}
        onOpenDriverScanner={() => {
          updateRole('driver');
          setActiveTab('driver');
        }}
      />

      {/* Student Bus QR Attendance Check-In Modal */}
      <StudentCheckIn
        isOpen={isStudentCheckInOpen}
        onClose={() => setIsStudentCheckInOpen(false)}
        buses={buses}
        onAttendanceConfirmed={(attendance) => {
          setAttendances((prev) => [...prev, attendance]);
        }}
      />

      {/* Google Login & Role Selector Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* AI Transit Route Advisor Floating Component */}
      <AiTransitAssistant
        buses={buses}
        onSelectBus={(bus) => setSelectedRouteBus(bus)}
        onSelectDestination={(dest) => setSearchedDestination(dest)}
      />

      {/* Footer */}
      <Footer onNavClick={handleNavClick} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
