
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base

engine = sqlalchemy.create_engine(
    'mysql+mysqlconnector://admin:12345678@project-9900.ceqw6zjtrmr5.us-east-2.rds.amazonaws.com:3306/project_db',
    echo=True)

conn = engine.connect()
# conn.execute('''CREATE TABLE IF NOT EXISTS testdb (
# todo_id INT AUTO_INCREMENT,
# task_id INT,
# todo VARCHAR(255) NOT NULL,
# is_completed BOOLEAN NOT NULL DEFAULT FALSE,
# PRIMARY KEY (todo_id)
# );''')
conn.execute('DROP TABLE testdb;')
conn.close()