-- schema.sql
CREATE TABLE IF NOT EXISTS reservations (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            customer_name TEXT NOT NULL,
                                            customer_email TEXT NOT NULL,
                                            reservation_date TEXT NOT NULL,
                                            reservation_time TEXT NOT NULL,
                                            service_type TEXT NOT NULL,
                                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);