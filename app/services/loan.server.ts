import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export const getLoan = async (
  loanId: string,
  select: Prisma.LoanSelect = {
    publicId: true,
    name: true,
    amount: true,
    interestRate: true,
    term: true,
    startAt: true,
    payments: {
      orderBy: {
        paidAt: "asc",
      },
    },
    intervalDayOfMonth: true,
  }
) => {
  const loans = await db.loan.findMany({
    where: { OR: [{ publicId: loanId }, { id: loanId }] },
    select,
  });

  if (loans.length == 0) {
    return { loan: undefined };
  }

  return { loan: loans[0] };
};
