import sqlite3

conn = sqlite3.connect('expense.db')
cursor = conn.cursor()

# ---------------- CREATE TABLES ---------------- #
cursor.execute('''
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS expense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT,
    description TEXT,
    amount REAL,
    payment TEXT,
    date TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user(id)
)
''')

conn.commit()
conn.close()
print("Database and tables created successfully!")
