import { LoaderFunctionArgs } from "@remix-run/node";
import { getLoan } from "~/services/loan.server";
import { getLoanStatementPDF } from "~/services/statement.server";
import { isTruthy } from "~/utils/boolean";
import { getSession } from "~/utils/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { loan } = await getLoan(params.loanId!);
  if (!loan) {
    throw new Response("Loan not found", {
      status: 404,
      statusText: "Not Found",
    });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const hasManageAccess = session.get("loans")?.includes(params.loanId!);

  if (!hasManageAccess) {
    throw new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const url = new URL(request.url);
  const includeAmortization =
    url.searchParams.has("amortize") &&
    isTruthy(url.searchParams.get("amortize"));

  return new Response(
    Buffer.from(
      await getLoanStatementPDF({
        loan,
        payments: loan.payments,
        includeAmortization,
      })
    ),
    {
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": `attachment; filename="stmt-${loan.publicId}.pdf"`,
      },
    }
  );
};
