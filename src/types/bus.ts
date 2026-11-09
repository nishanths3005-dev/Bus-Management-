export type UserRole = 'student' | 'driver' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  campus?: string; // e.g. "Jain University - JGI Global Campus"
  assignedBusId?: string; // For drivers or students
  studentId?: string; // e.g. "JU2024CS1092"
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BusTransitStatus = 'scheduled' | 'boarding' | 'in_transit' | 'completed';

export interface BusRoute {
  id: string;
  busNumber: string;
  routeName: string;
  shift: string;
  departureTime: string;
  driverName: string;
  driverPhone: string;
  driverUid?: string;
  totalSeats: number;
  availableSeats: number;
  stops: string[]; // e.g. ["Jain Global Campus", "Kanakapura Road", "Banashankari", "Jayanagar"]
  campus?: string;
  description?: string;
  status?: BusTransitStatus;
  currentStop?: string;
  seatOccupancy?: boolean[];
  updatedAt?: string;
}

export type AvailabilityStatus = 'high' | 'medium' | 'low';

export function getAvailabilityStatus(available: number, total: number): AvailabilityStatus {
  const percentage = (available / total) * 100;
  if (percentage > 50) return 'high';
  if (percentage >= 20) return 'medium';
  return 'low';
}

export interface SeatReservation {
  id: string;
  busId: string;
  busNumber: string;
  routeName: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId?: string;
  seatNumber: number;
  destinationStop: string;
  bookingDate: string;
  status: 'active' | 'checked_in' | 'cancelled';
  createdAt: string;
  checkedInAt?: string;
}

export interface StudentAttendance {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  busId: string;
  busNumber: string;
  routeName: string;
  scannedAt: string;
  date: string;
  boardingPoint: string;
  status: 'confirmed' | 'flagged';
}
