CREATE TABLE medemap_aug.application_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  url TEXT NOT NULL,
  user_agent TEXT,
  load_time INTEGER,
  dom_ready_time INTEGER
);

CREATE INDEX idx_application_logs_timestamp ON medemap_aug.application_logs (timestamp);
CREATE INDEX idx_application_logs_level ON medemap_aug.application_logs (level);