const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const composePath = path.resolve(__dirname, '../docker-compose.yml');
const fileStr = fs.readFileSync(composePath, 'utf8');

const doc = yaml.parse(fileStr);

// 1. Add Network
if (!doc.networks) doc.networks = {};
doc.networks['pec-network'] = { driver: 'bridge' };

// 2. Iterate through services to add network, logging, and resources
for (const [serviceName, service] of Object.entries(doc.services)) {
  // Add network
  if (!service.networks) service.networks = [];
  if (!service.networks.includes('pec-network')) {
    service.networks.push('pec-network');
  }

  // Add Log Rotation
  service.logging = {
    driver: 'json-file',
    options: {
      'max-size': '10m',
      'max-file': '3'
    }
  };

  // Add Resources Limits
  service.deploy = {
    resources: {
      limits: {
        cpus: '1.0',
        memory: '1024M'
      }
    }
  };
}

// 3. Add Healthchecks
// Postgres
if (doc.services.postgres) {
  doc.services.postgres.healthcheck = {
    test: ["CMD-SHELL", "pg_isready -U postgres -d pec"],
    interval: "10s",
    timeout: "5s",
    retries: 5
  };
}

// Redis
if (doc.services.redis) {
  doc.services.redis.healthcheck = {
    test: ["CMD", "redis-cli", "ping"],
    interval: "10s",
    timeout: "5s",
    retries: 5
  };
}

// RabbitMQ
if (doc.services.rabbitmq) {
  doc.services.rabbitmq.healthcheck = {
    test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"],
    interval: "10s",
    timeout: "5s",
    retries: 5
  };
}

// Update backend dependencies to wait for healthy services
if (doc.services.backend && doc.services.backend.depends_on) {
  // Convert depends_on from array to object if it isn't already
  if (Array.isArray(doc.services.backend.depends_on)) {
    const depsObj = {};
    doc.services.backend.depends_on.forEach(dep => {
      if (['postgres', 'redis', 'rabbitmq'].includes(dep)) {
        depsObj[dep] = { condition: 'service_healthy' };
      } else {
        depsObj[dep] = { condition: 'service_started' };
      }
    });
    doc.services.backend.depends_on = depsObj;
  }
}

// Update dev_worker dependencies
if (doc.services.dev_worker && doc.services.dev_worker.depends_on) {
  if (Array.isArray(doc.services.dev_worker.depends_on)) {
    const depsObj = {};
    doc.services.dev_worker.depends_on.forEach(dep => {
      if (['postgres', 'redis', 'rabbitmq'].includes(dep)) {
        depsObj[dep] = { condition: 'service_healthy' };
      } else {
        depsObj[dep] = { condition: 'service_started' };
      }
    });
    doc.services.dev_worker.depends_on = depsObj;
  }
}

const updatedYaml = yaml.stringify(doc);
fs.writeFileSync(composePath, updatedYaml, 'utf8');
console.log('Successfully updated docker-compose.yml with advanced configurations!');
