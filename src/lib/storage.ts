import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'withdrawn';
  amount: number;
  userId: string;
  timestamp: number;
  upiId?: string;
}

export interface PaymentQRData {
  type: 'PAYMENT';
  tx_id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export interface UserData {
  userId: string;
  balance: number;
  upiId: string;
  transactions: Transaction[];
  processedPayments: string[]; // Track processed tx_ids to prevent double-spending
}

const STORAGE_KEY = 'offlinepay_user';

export function generateUserId(): string {
  const shortId = uuidv4().split('-')[0].toUpperCase();
  return `USR_${shortId}`;
}

export function generateTxId(): string {
  const shortId = uuidv4().split('-')[0].toUpperCase();
  return `TX_${shortId}`;
}

export function getUserData(): UserData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    // Ensure processedPayments array exists for legacy data
    if (!data.processedPayments) {
      data.processedPayments = [];
    }
    return data;
  }
  
  // Initialize new user
  const newUser: UserData = {
    userId: generateUserId(),
    balance: 500, // Demo balance
    upiId: '',
    transactions: [],
    processedPayments: [],
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

/**
 * STEP 1: Sender initiates payment - deducts balance and creates payment QR data
 * Returns the payment QR data that receiver must scan
 */
export function initiatePayment(receiverId: string, amount: number): { 
  success: boolean; 
  message: string; 
  paymentQR?: PaymentQRData 
} {
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
  
  // Generate unique transaction ID
  const txId = generateTxId();
  const timestamp = Date.now();
  
  // Deduct from sender's balance
  senderData.balance -= amount;
  
  // Add to sender's transaction history
  senderData.transactions.unshift({
    id: uuidv4(),
    type: 'sent',
    amount,
    userId: receiverId,
    timestamp,
  });
  
  saveUserData(senderData);
  
  // Create payment QR data for receiver to scan
  const paymentQR: PaymentQRData = {
    type: 'PAYMENT',
    tx_id: txId,
    from: senderData.userId,
    to: receiverId,
    amount,
    timestamp,
  };
  
  return { 
    success: true, 
    message: 'Payment initiated. Show QR to receiver.', 
    paymentQR 
  };
}

/**
 * STEP 2: Receiver scans payment QR and receives the money
 * This completes the offline payment flow
 */
export function receivePayment(paymentData: PaymentQRData): { 
  success: boolean; 
  message: string;
  amount?: number;
  fromUser?: string;
} {
  const receiverData = getUserData();
  
  // Validate payment is for this user
  if (paymentData.to !== receiverData.userId) {
    return { 
      success: false, 
      message: 'This payment is not for you' 
    };
  }
  
  // Check if payment was already processed (prevent double-spending)
  if (receiverData.processedPayments.includes(paymentData.tx_id)) {
    return { 
      success: false, 
      message: 'This payment has already been received' 
    };
  }
  
  // Validate payment data
  if (paymentData.type !== 'PAYMENT' || !paymentData.amount || paymentData.amount <= 0) {
    return { 
      success: false, 
      message: 'Invalid payment data' 
    };
  }
  
  // Add to balance
  receiverData.balance += paymentData.amount;
  
  // Add to transaction history
  receiverData.transactions.unshift({
    id: uuidv4(),
    type: 'received',
    amount: paymentData.amount,
    userId: paymentData.from,
    timestamp: paymentData.timestamp,
  });
  
  // Mark payment as processed
  receiverData.processedPayments.push(paymentData.tx_id);
  
  saveUserData(receiverData);
  
  return { 
    success: true, 
    message: `Received ₹${paymentData.amount} from ${paymentData.from}`,
    amount: paymentData.amount,
    fromUser: paymentData.from
  };
}

// Keep for backward compatibility but mark as deprecated
export function processPayment(receiverId: string, amount: number): { success: boolean; message: string } {
  const result = initiatePayment(receiverId, amount);
  return { success: result.success, message: result.message };
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
