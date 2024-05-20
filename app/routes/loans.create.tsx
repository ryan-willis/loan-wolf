export default function CreateLoanRoute() {
  return (
    <div>
      <h1>Create a Loan</h1>
      <form>
        <label>
          Loan Amount
          <input type="number" />
        </label>
        <label>
          Interest Rate
          <input type="number" />
        </label>
        <label>
          Term
          <input type="number" />
        </label>
        <button>Create Loan</button>
      </form>
    </div>
  );
}
