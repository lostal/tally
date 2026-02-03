/**
 * Mock data for interactive demo
 * Simulates a real restaurant order for the landing page demo
 */

export const mockRestaurant = {
  name: 'La Cervecería',
  logoUrl: undefined, // Will show "LC" initials
  isVerified: true,
};

export const mockTable = {
  number: '7',
};

export const mockOrderItems = [
  {
    id: '1',
    name: 'Hamburguesa con queso',
    quantity: 2,
    unitPriceCents: 1250,
    isSelected: false,
    claimedQuantity: 0,
  },
  {
    id: '2',
    name: 'Patatas fritas',
    quantity: 1,
    unitPriceCents: 450,
    isSelected: false,
    claimedQuantity: 0,
  },
  {
    id: '3',
    name: 'Cerveza artesana',
    quantity: 3,
    unitPriceCents: 550,
    isSelected: false,
    claimedQuantity: 0,
  },
  {
    id: '4',
    name: 'Ensalada César',
    quantity: 1,
    unitPriceCents: 850,
    isSelected: false,
    claimedQuantity: 0,
  },
  {
    id: '5',
    name: 'Tarta de queso',
    quantity: 2,
    unitPriceCents: 650,
    isSelected: false,
    claimedQuantity: 0,
  },
];

// Calculate total bill
export const mockBillTotal = mockOrderItems.reduce(
  (total, item) => total + item.unitPriceCents * item.quantity,
  0
);

// Number of participants (for DYNAMIC_EQUAL)
export const mockParticipantCount = 4;
