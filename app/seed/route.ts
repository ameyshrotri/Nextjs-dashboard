import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const client = await db.connect();

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    await client.sql`BEGIN`;
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}



// // import bcrypt from 'bcrypt';
// // import { db, Client } from '@vercel/postgres';
// // import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// // const {
// //   POSTGRES_URL,
// //   POSTGRES_USER,
// //   POSTGRES_HOST,
// //   POSTGRES_PASSWORD,
// //   POSTGRES_DATABASE,
// // } = process.env;

// // const isPlaceholder = POSTGRES_URL === "placeholder_connection_string" ||
// //                       POSTGRES_USER === "placeholder_user" ||
// //                       POSTGRES_HOST === "placeholder_host" ||
// //                       POSTGRES_PASSWORD === "placeholder_password" ||
// //                       POSTGRES_DATABASE === "placeholder_database";

// // async function seedUsers(client: Client) {
// //   await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
// //   await client.query(`
// //     CREATE TABLE IF NOT EXISTS users (
// //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// //       name VARCHAR(255) NOT NULL,
// //       email TEXT NOT NULL UNIQUE,
// //       password TEXT NOT NULL
// //     )
// //   `);

// //   const insertedUsers = await Promise.all(
// //     users.map(async (user) => {
// //       const hashedPassword = await bcrypt.hash(user.password, 10);
// //       const queryText = `
// //         INSERT INTO users (id, name, email, password)
// //         VALUES ($1, $2, $3, $4)
// //         ON CONFLICT (id) DO NOTHING
// //       `;
// //       const values = [user.id, user.name, user.email, hashedPassword];
// //       return client.query(queryText, values);
// //     }),
// //   );

// //   return insertedUsers;
// // }

// // async function seedInvoices(client: Client) {
// //   await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
// //   await client.query(`
// //     CREATE TABLE IF NOT EXISTS invoices (
// //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// //       customer_id UUID NOT NULL,
// //       amount INT NOT NULL,
// //       status VARCHAR(255) NOT NULL,
// //       date DATE NOT NULL
// //     )
// //   `);

// //   const insertedInvoices = await Promise.all(
// //     invoices.map(async (invoice) => {
// //       const queryText = `
// //         INSERT INTO invoices (id, customer_id, amount, status, date)
// //         VALUES ($1, $2, $3, $4, $5)
// //         ON CONFLICT (id) DO NOTHING
// //       `;
// //       const values = [invoice.id, invoice.customer_id, invoice.amount, invoice.status, invoice.date];
// //       return client.query(queryText, values);
// //     }),
// //   );

// //   return insertedInvoices;
// // }

// // async function seedCustomers(client: Client) {
// //   await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
// //   await client.query(`
// //     CREATE TABLE IF NOT EXISTS customers (
// //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// //       name VARCHAR(255) NOT NULL,
// //       email VARCHAR(255) NOT NULL,
// //       image_url VARCHAR(255) NOT NULL
// //     )
// //   `);

// //   const insertedCustomers = await Promise.all(
// //     customers.map(async (customer) => {
// //       const queryText = `
// //         INSERT INTO customers (id, name, email, image_url)
// //         VALUES ($1, $2, $3, $4)
// //         ON CONFLICT (id) DO NOTHING
// //       `;
// //       const values = [customer.id, customer.name, customer.email, customer.image_url];
// //       return client.query(queryText, values);
// //     }),
// //   );

// //   return insertedCustomers;
// // }

// // async function seedRevenue(client: Client) {
// //   await client.query(`
// //     CREATE TABLE IF NOT EXISTS revenue (
// //       month VARCHAR(4) NOT NULL UNIQUE,
// //       revenue INT NOT NULL
// //     )
// //   `);

// //   const insertedRevenue = await Promise.all(
// //     revenue.map(async (rev) => {
// //       const queryText = `
// //         INSERT INTO revenue (month, revenue)
// //         VALUES ($1, $2)
// //         ON CONFLICT (month) DO NOTHING
// //       `;
// //       const values = [rev.month, rev.revenue];
// //       return client.query(queryText, values);
// //     }),
// //   );

// //   return insertedRevenue;
// // }

// // export async function GET() {
// //   if (isPlaceholder) {
// //     console.log('Skipping database connection during build');
// //     return new Response(JSON.stringify({ message: 'Skipping database connection during build' }), { status: 200 });
// //   }

// //   const client = new Client({
// //     connectionString: POSTGRES_URL,
// //     user: POSTGRES_USER,
// //     host: POSTGRES_HOST,
// //     password: POSTGRES_PASSWORD,
// //     database: POSTGRES_DATABASE,
// //   });

// //   try {
// //     await client.connect();
// //     await client.query('BEGIN');
// //     await seedUsers(client);
// //     await seedCustomers(client);
// //     await seedInvoices(client);
// //     await seedRevenue(client);
// //     await client.query('COMMIT');

// //     return new Response(JSON.stringify({ message: 'Database seeded successfully' }), { status: 200 });
// //   } catch (error) {
// //     await client.query('ROLLBACK');
// //     console.error('Database seeding error', error);
// //     return new Response(JSON.stringify({ error: 'Database seeding failed' }), { status: 500 });
// //   } finally {
// //     await client.end();
// //   }
// // }
