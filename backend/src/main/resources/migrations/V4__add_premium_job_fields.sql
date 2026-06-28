ALTER TABLE jobs
ADD COLUMN last_date_to_apply VARCHAR(255),
ADD COLUMN experience_required VARCHAR(255),
ADD COLUMN education_required VARCHAR(255),
ADD COLUMN skills VARCHAR(512),
ADD COLUMN work_mode VARCHAR(50);
