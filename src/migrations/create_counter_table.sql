CREATE TABLE counters (
  name VARCHAR(50) PRIMARY KEY,
  current INT NOT NULL
);

INSERT INTO counters (name, current) VALUES ('invoice', 0);