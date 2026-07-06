import sqlite3

conn = sqlite3.connect('cyberpitch.db')
cursor = conn.cursor()

# Show all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("=== TABLES IN DATABASE ===")
for t in tables:
    print(" -", t[0])

print()

# Show all records in scan_history
cursor.execute("SELECT id, domain, risk_score, created_at FROM scan_history ORDER BY created_at DESC")
rows = cursor.fetchall()
print(f"=== SCAN HISTORY ({len(rows)} total records) ===")
print(f"{'ID':<5} {'DOMAIN':<45} {'RISK SCORE':<12} SCANNED AT")
print("-" * 95)
for row in rows:
    print(f"{str(row[0]):<5} {str(row[1]):<45} {str(row[2]):<12} {row[3]}")

# Check for duplicates
cursor.execute("SELECT domain, COUNT(*) as cnt FROM scan_history GROUP BY domain HAVING cnt > 1")
dupes = cursor.fetchall()
print()
if dupes:
    print(f"=== DUPLICATE DOMAINS FOUND ({len(dupes)}) ===")
    for d in dupes:
        print(f"  '{d[0]}' appears {d[1]} times")
else:
    print("=== NO DUPLICATES FOUND - Each domain is stored only once ===")

conn.close()
