import { BusRoute } from '../types/bus';

function generateSeatOccupancy(total: number, available: number): boolean[] {
  const booked = total - available;
  const seats = new Array(total).fill(false);
  let bookedCount = 0;
  for (let i = 0; i < total && bookedCount < booked; i++) {
    if (i % 3 !== 2 || bookedCount + (total - i) <= booked) {
      seats[i] = true;
      bookedCount++;
    }
  }
  for (let i = 0; i < total && bookedCount < booked; i++) {
    if (!seats[i]) {
      seats[i] = true;
      bookedCount++;
    }
  }
  return seats;
}

export const PREDEFINED_BUS_ROUTES: BusRoute[] = [
  {
    id: 'bus-1',
    busNumber: 'KA-01-JU-101',
    routeName: 'Route A',
    shift: 'South Campus Express',
    departureTime: '04:45 PM (Jain Bay 1)',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98450 12345',
    driverUid: 'driver-101',
    totalSeats: 40,
    availableSeats: 12,
    stops: ['Jain Global Campus', 'JP Nagar', 'Jayanagar', 'Banashankari'],
    campus: 'Jain Global Campus',
    description: 'Serves South Bangalore corridor via Ring Road and metro connection points.',
    status: 'boarding',
    currentStop: 'Jain Global Campus (Bay 1)',
    seatOccupancy: generateSeatOccupancy(40, 12),
  },
  {
    id: 'bus-2',
    busNumber: 'KA-01-JU-102',
    routeName: 'Route B',
    shift: 'IT Corridor Line',
    departureTime: '04:45 PM (Jain Bay 2)',
    driverName: 'Suresh Gowda',
    driverPhone: '+91 98451 23456',
    driverUid: 'driver-102',
    totalSeats: 40,
    availableSeats: 25,
    stops: ['Jain Global Campus', 'Electronic City', 'Bommasandra'],
    campus: 'Jain Global Campus',
    description: 'Direct transit line connecting Electronic City Phase 1 & 2 to Bommasandra Industrial area.',
    status: 'scheduled',
    currentStop: 'Waiting at Gate 2',
    seatOccupancy: generateSeatOccupancy(40, 25),
  },
  {
    id: 'bus-3',
    busNumber: 'KA-01-JU-103',
    routeName: 'Route C',
    shift: 'Border Express',
    departureTime: '04:45 PM (Jain Bay 3)',
    driverName: 'Manjunath B.',
    driverPhone: '+91 98452 34567',
    driverUid: 'driver-103',
    totalSeats: 40,
    availableSeats: 8,
    stops: ['Jain Global Campus', 'Hosur', 'Attibele'],
    campus: 'Jain Global Campus',
    description: 'Connects interstate border students commuting between Attibele checkpost and Hosur town.',
    status: 'scheduled',
    currentStop: 'Fueling Bay',
    seatOccupancy: generateSeatOccupancy(40, 8),
  },
  {
    id: 'bus-4',
    busNumber: 'KA-01-JU-104',
    routeName: 'Route D',
    shift: 'Central & Tech Parks Line',
    departureTime: '04:45 PM (Jain Bay 4)',
    driverName: 'Anand Murthy',
    driverPhone: '+91 98453 45678',
    driverUid: 'driver-104',
    totalSeats: 40,
    availableSeats: 18,
    stops: ['Jain Global Campus', 'BTM Layout', 'Silk Board', 'Koramangala'],
    campus: 'Jain Global Campus',
    description: 'High-density tech corridor covering Silk Board junction, BTM Layout stages and Koramangala.',
    status: 'scheduled',
    currentStop: 'Jain Bay 4',
    seatOccupancy: generateSeatOccupancy(40, 18),
  },
];

export const PREDEFINED_DESTINATIONS: string[] = [
  'JP Nagar',
  'Jayanagar',
  'Electronic City',
  'Bommasandra',
  'Hosur',
  'Attibele',
  'Banashankari',
  'BTM Layout',
  'Koramangala',
  'Silk Board',
];
