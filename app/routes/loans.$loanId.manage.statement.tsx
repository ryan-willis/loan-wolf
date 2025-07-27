import { LoaderFunctionArgs } from "@remix-run/node";
import { getLoan } from "~/services/loan.server";
import { getLoanStatementPDF } from "~/services/statement.server";
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

  const { origin } = new URL(request.url);
  const linkUrl = `${origin}/loans/${loan.publicId}`;

  if (!hasManageAccess) {
    throw new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  return new Response(
    await getLoanStatementPDF({
      loan,
      payments: loan.payments,
      linkUrl,
    }),
    {
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": `attachment; filename="stmt-${loan.publicId}.pdf"`,
      },
    }
  );
};
