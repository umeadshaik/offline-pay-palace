import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'withdrawn';
  amount: number;
  userId: string;
  timestamp: number;
  upiId?: string;
}

export interface UserData {
  userId: string;
  balance: number;
  upiId: string;
  transactions: Transaction[];
}

const STORAGE_KEY = 'offlinepay_user';

export function generateUserId(): string {
  const shortId = uuidv4().split('-')[0].toUpperCase();
  return `USR_${shortId}`;
}

export function getUserData(): UserData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize new user
  const newUser: UserData = {
    userId: generateUserId(),
    balance: 500, // Demo balance
    upiId: '',
    transactions: [],
  };
  
  saveUserData(newUser);
  return newUser;
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateBalance(amount: number): UserData {
  const data = getUserData();
  data.balance += amount;
  saveUserData(data);
  return data;
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): UserData {
  const data = getUserData();
  const newTransaction: Transaction = {
    ...transaction,
    id: uuidv4(),
    timestamp: Date.now(),
  };
  data.transactions.unshift(newTransaction);
  saveUserData(data);
  return data;
}

export function updateUpiId(upiId: string): UserData {
  const data = getUserData();
  data.upiId = upiId;
  saveUserData(data);
  return data;
}

export function processPayment(receiverId: string, amount: number): { success: boolean; message: string } {
  const senderData = getUserData();
  
  if (amount <= 0) {
    return { success: false, message: 'Invalid amount' };
  }
  
  if (senderData.balance < amount) {
    return { success: false, message: 'Insufficient balance' };
  }
  
  if (receiverId === senderData.userId) {
    return { success: false, message: 'Cannot send to yourself' };
  }
  
  // Deduct from sender
  senderData.balance -= amount;
  senderData.transactions.unshift({
    id: uuidv4(),
    type: 'sent',
    amount,
    userId: receiverId,
    timestamp: Date.now(),
  });
  saveUserData(senderData);
  
  // Note: In a real offline scenario, the receiver would need to sync later
  // For demo purposes, we simulate the receiver's balance increase
  // This would typically happen via Bluetooth/NFC in a real app
  
  return { success: true, message: 'Payment successful' };
}

export function processWithdrawal(amount: number, upiId: string): { success: boolean; message: string } {
  const data = getUserData();
  
  if (amount <= 0) {
    return { success: false, message: 'Invalid amount' };
  }
  
  if (data.balance < amount) {
    return { success: false, message: 'Insufficient balance' };
  }
  
  if (!upiId.includes('@')) {
    return { success: false, message: 'Invalid UPI ID' };
  }
  
  // Deduct balance
  data.balance -= amount;
  data.upiId = upiId;
  data.transactions.unshift({
    id: uuidv4(),
    type: 'withdrawn',
    amount,
    userId: 'UPI',
    upiId,
    timestamp: Date.now(),
  });
  saveUserData(data);
  
  return { success: true, message: `₹${amount} sent to ${upiId} (demo)` };
}
