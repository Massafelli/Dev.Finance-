const Modal = {
  open: function () {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close: function () {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get: function () {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set: function (transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transactions = {
  all: Storage.get(),

  add: function (transaction) {
    Transactions.all.push(transaction);
    app.reload();
  },
  remove: function (index) {
    Transactions.all.splice(index, 1);
    app.reload();
  },
  incomes: function () {
    let income = 0;

    Transactions.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },
  expenses: function () {
    let expense = 0;

    Transactions.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });

    return expense;
  },
  total: function () {
    return Transactions.incomes() + Transactions.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction: function (transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction: function (transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";

    const amount = utils.formatCurrency(transaction.amount);
    const html = `
                <td class="description">${transaction.description}</td>
                <td class="${cssClass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                    <img onclick='Transactions.remove(${index})' src="./assets/minus.svg" alt="Remover transação" srcset="">
                </td>
            `;

    return html;
  },

  updateBalance: function () {
    document.getElementById("income-display").innerHTML = utils.formatCurrency(
      Transactions.incomes()
    );
    document.getElementById("expense-display").innerHTML = utils.formatCurrency(
      Transactions.expenses()
    );
    document.getElementById("total-display").innerHTML = utils.formatCurrency(
      Transactions.total()
    );
  },
  clearTransactions: function () {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const utils = {
  formatCurrency: function (value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
  formatAmount: function (value) {
    value = Number(value) * 100;

    return value;
  },
  formatDate: function (date) {
    const splittedDate = date.split("-");

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  getValues: function () {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value,
    };
  },
  validadeFields: function () {
    const { description, amount, date } = form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },
  formatValues: function () {
    let { description, amount, date } = form.getValues();

    amount = utils.formatAmount(amount);

    date = utils.formatDate(date);

    return { description, amount, date };
  },
  clearFields: function () {
    form.description.value = "";
    form.amount.value = "";
    form.date.value = "";
  },
  saveTransaction: function (transaction) {
    Transactions.add(transaction);
  },
  submit: function (event) {
    event.preventDefault();

    try {
      form.validadeFields();
      const transaction = form.formatValues();
      form.saveTransaction(transaction);
      form.clearFields();
      Modal.close();
    } catch (err) {
      alert(err.message);
    }
  },
};

const app = {
  init: function () {
    Transactions.all.forEach((transaction) => {
      DOM.addTransaction(transaction);

      Storage.set(Transactions.all);
    });

    DOM.updateBalance();
  },
  reload: function () {
    DOM.clearTransactions();
    app.init();
  },
};

app.init();
