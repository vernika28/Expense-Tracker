from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_bcrypt import Bcrypt
from datetime import datetime
import sqlite3

app = Flask(__name__)
app.secret_key = 'your_secret_key'
bcrypt = Bcrypt(app)

DATABASE = 'expense.db'

# ------------------ HELPER FUNCTIONS ------------------ #
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = OFF")
    return conn

# ------------------ ROUTES ------------------ #
@app.route('/')
def home():
    return redirect(url_for('login'))

# --------- SIGNUP ---------
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM user WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return render_template('signup.html', error="Email already registered!")

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        cursor.execute(
            "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
            (name, email, hashed_pw)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('login'))

    return render_template('signup.html')

# --------- LOGIN ---------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error="Invalid credentials!")

    return render_template('login.html')

# ----------------- DASHBOARD -----------------
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM user WHERE id = ?", (session['user_id'],))
    user = cursor.fetchone()

    now = datetime.now()
    month_name = now.strftime("%B")
    month_number = now.strftime("%m")
    year = now.year

    # Fetch expenses
    cursor.execute(
        "SELECT * FROM expense WHERE user_id=? AND strftime('%m', date)=? AND strftime('%Y', date)=?",
        (session['user_id'], month_number, str(year))
    )
    expenses = cursor.fetchall()


    expenses_dict = [
        {
            "id": row["id"],
            "category": row["category"],
            "description": row["description"],
            "amount": float(row["amount"]) if row["amount"] else 0.0,
            "payment": row["payment"],
            "date": row["date"]
        } for row in expenses
    ]

    total_spent = sum(e["amount"] for e in expenses_dict)

    # Category totals
    category_totals = {}
    for e in expenses_dict:
        category_totals[e["category"]] = category_totals.get(e["category"], 0) + e["amount"]

 
    cursor.execute(
        "SELECT amount FROM budget WHERE user_id=? AND month=? AND year=?",
        (session['user_id'], month_name, year)
    )
    budget_row = cursor.fetchone()
    user_budget = float(budget_row["amount"]) if budget_row else 0.0  # <-- important
    remaining = user_budget - total_spent if user_budget > 0 else 0.0

    conn.close()

    return render_template(
        "dashboard.html",
        user=user,
        expenses_json=expenses_dict, 
        category_totals=category_totals, 
        total_spent=total_spent,
        user_budget=user_budget, 
        remaining=remaining 
    )


    # -------- CATEGORY TOTALS --------
    category_totals = {}
    for e in expenses_dict:
        category_totals[e["category"]] = category_totals.get(e["category"], 0) + e["amount"]

    # -------- GET BUDGET --------
    cursor.execute(
        "SELECT * FROM budget WHERE user_id=? AND month=? AND year=?",
        (session['user_id'], month_name, year)
    )
    budget_row = cursor.fetchone()
    user_budget = float(budget_row["amount"]) if budget_row else None

    remaining = user_budget - total_spent if user_budget else None

    conn.close()

    return render_template(
        "dashboard.html",
        user=user,
        expenses_json=expenses_dict,
        category_totals=category_totals,
        total_spent=total_spent,
        user_budget=user_budget,
        remaining=remaining
    )

# --------- ADD EXPENSE ---------
@app.route('/add-expense', methods=['GET', 'POST'])
def add_expense():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        category = request.form['category']
        description = request.form['description']
        amount = float(request.form['amount'])
        payment = request.form['payment']
        date = request.form['date']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO expense (user_id, category, description, amount, payment, date) VALUES (?, ?, ?, ?, ?, ?)",
            (session['user_id'], category, description, amount, payment, date)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('view_expense'))

    return render_template('add_expense.html')

# --------- VIEW EXPENSES ---------
@app.route('/view-expense')
def view_expense():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM expense WHERE user_id=?", (session['user_id'],))
    expenses = cursor.fetchall()

    # Convert SQLite Row objects to dictionaries
    expenses_list = [
        {
            "id": e["id"],
            "date": e["date"],
            "category": e["category"],
            "description": e["description"],
            "amount": float(e["amount"]),
            "payment": e["payment"]
        }
        for e in expenses
    ]

    cursor.execute("SELECT SUM(amount) FROM expense WHERE user_id=?", (session['user_id'],))
    total_spent = cursor.fetchone()[0] or 0

    cursor.execute("SELECT MAX(amount) FROM expense WHERE user_id=?", (session['user_id'],))
    highest_expense = cursor.fetchone()[0] or 0

    total_transactions = len(expenses)
    conn.close()

    return render_template(
        "view_expense.html",
        expenses=expenses_list,  
        total_spent=total_spent,
        highest_expense=highest_expense,
        total_transactions=total_transactions
    )

# --------- EDIT EXPENSE ---------
@app.route('/edit-expense/<int:expense_id>', methods=['GET', 'POST'])
def edit_expense(expense_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM expense WHERE id=? AND user_id=?",
        (expense_id, session['user_id'])
    )
    expense = cursor.fetchone()

    if not expense:
        conn.close()
        return "Expense not found", 404

    if request.method == 'POST':
        category = request.form['category']
        description = request.form['description']
        amount = float(request.form['amount'])
        payment = request.form['payment']
        date = request.form['date']

        cursor.execute("""
            UPDATE expense
            SET category=?, description=?, amount=?, payment=?, date=?
            WHERE id=?
        """, (category, description, amount, payment, date, expense_id))

        conn.commit()
        conn.close()
        return redirect(url_for('view_expense'))

    conn.close()
    return render_template("edit_expense.html", expense=expense)


# --------- DELETE EXPENSE ---------
@app.route('/delete-expense/<int:expense_id>', methods=['POST'])
def delete_expense(expense_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM expense WHERE id=? AND user_id=?",
        (expense_id, session['user_id'])
    )
    expense = cursor.fetchone()

    if expense:
        cursor.execute("DELETE FROM expense WHERE id=?", (expense_id,))
        conn.commit()

    conn.close()
    return redirect(url_for('view_expense'))

# ----------------- UPDATE BUDGET -----------------
@app.route('/update-budget', methods=['POST'])
def update_budget():
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "User not logged in"})

   
    data = request.get_json(force=True)
    if not data or "budget" not in data:
        return jsonify({"success": False, "message": "No budget provided"})

    try:
        budget_amount = float(data["budget"])
        if budget_amount <= 0:
            return jsonify({"success": False, "message": "Budget must be greater than zero"})
    except ValueError:
        return jsonify({"success": False, "message": "Invalid budget value"})

    user_id = session['user_id']
    now = datetime.now()
    month = now.strftime("%B")
    year = now.year

    conn = get_db_connection()
    cursor = conn.cursor()

  
    cursor.execute(
        "SELECT id FROM budget WHERE user_id=? AND month=? AND year=?",
        (user_id, month, year)
    )
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            "UPDATE budget SET amount=? WHERE id=?",
            (budget_amount, existing["id"])
        )
    else:
        cursor.execute(
            "INSERT INTO budget (user_id, month, year, amount) VALUES (?, ?, ?, ?)",
            (user_id, month, year, budget_amount)
        )

    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Budget updated successfully"})


# --------- LOGOUT ---------
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

# ------------------ RUN APP ------------------ #
if __name__ == '__main__':
    app.run(debug=True)

