\c biztime

DROP TABLE IF EXISTS invoices cascade;
DROP TABLE IF EXISTS companies cascade;
DROP TABLE IF EXISTS industries cascade;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE industries (
  industry text NOT NULL UNIQUE,
  code text PRIMARY KEY
);

-- making an intersection table 
CREATE TABLE industry_company (
  comp_code text,
  ind_code text,
  CONSTRAINT ind_comp_id PRIMARY KEY (ind_code, comp_code),
  CONSTRAINT FK_comp_code FOREIGN KEY (comp_code) REFERENCES companies (code) ON DELETE CASCADE,
  CONSTRAINT FK_ind_code FOREIGN KEY (ind_code) REFERENCES industries (code) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO industry_company 
  VALUES ('tech', 'apple'),
         ('bis', 'ibm');

INSERT INTO industries 
  VALUES ('Technology', 'tech'),
         ('Business', 'bis');

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);


SELECT i.code, i.industry, c.code
FROM industries AS i 
LEFT JOIN industry_company AS ic
ON i.code = ic.ind_code
LEFT JOIN companies AS c
ON c.code = ic.comp_code
WHERE i.code = 'tech';