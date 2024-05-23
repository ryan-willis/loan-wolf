// NOTE: probably best to leave this enum alone, the values are used in the database
export enum PaymentInterval {
  DAILY = 1,
  WEEKLY = 2,
  BIWEEKLY = 3,
  SEMIMONTHLY = 4,
  MONTHLY = 5,
  QUARTERLY = 6,
  SEMIANNUALLY = 7,
  ANNUALLY = 8,
}

export function getPaymentIntervalString(interval: PaymentInterval): string {
  switch (interval) {
    case PaymentInterval.DAILY:
      return "Daily";
    case PaymentInterval.WEEKLY:
      return "Weekly";
    case PaymentInterval.BIWEEKLY:
      return "Bi-weekly";
    case PaymentInterval.SEMIMONTHLY:
      return "Semi-monthly";
    case PaymentInterval.MONTHLY:
      return "Monthly";
    case PaymentInterval.QUARTERLY:
      return "Quarterly";
    case PaymentInterval.SEMIANNUALLY:
      return "Semi-annually";
    case PaymentInterval.ANNUALLY:
      return "Annually";
    default:
      return "Unknown";
  }
}

export interface ILoan {
  originalAmount: number;
  interestRate: number;
  term: number;
  currentAmount: number;
}

export interface IPayment {
  date?: number;
  amount: number;
}
