const base = process.env.BASE_URL || 'http://localhost:3000';

async function call(method, path, body, token) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: response.status, json, text };
}

async function registerRole(role, suffix) {
  const payload = {
    email: `rbac_${role}_${suffix}@example.com`,
    password: 'Passw0rd!',
    name: `RBAC ${role}`,
    role,
  };

  const result = await call('POST', '/auth/register', payload);
  return {
    role,
    registerStatus: result.status,
    token: result.json?.access_token,
  };
}

async function main() {
  const suffix = Date.now();

  const student = await registerRole('student', suffix);
  const faculty = await registerRole('faculty', suffix);
  const admin = await registerRole('college_admin', suffix);

  console.log(`REGISTER: student=${student.registerStatus} faculty=${faculty.registerStatus} admin=${admin.registerStatus}`);

  const jobPayload = {
    title: 'RBAC Test Job',
    company: 'Omnifow',
    location: 'Remote',
    type: 'Internship',
    deadline: '2027-01-01T00:00:00.000Z',
  };

  const tests = [
    {
      case: 'student GET /attendance (deny)',
      expect: 403,
      actual: (await call('GET', '/attendance', null, student.token)).status,
    },
    {
      case: 'faculty GET /attendance (allow)',
      expect: 200,
      actual: (await call('GET', '/attendance', null, faculty.token)).status,
    },
    {
      case: 'student GET /jobs (allow)',
      expect: 200,
      actual: (await call('GET', '/jobs', null, student.token)).status,
    },
    {
      case: 'faculty POST /jobs (deny)',
      expect: 403,
      actual: (await call('POST', '/jobs', jobPayload, faculty.token)).status,
    },
    {
      case: 'admin POST /jobs (allow)',
      expect: 201,
      actual: (await call('POST', '/jobs', jobPayload, admin.token)).status,
    },
  ];

  const withPass = tests.map((test) => ({
    ...test,
    pass: test.actual === test.expect,
  }));

  console.table(withPass);

  const failures = withPass.filter((test) => !test.pass);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
