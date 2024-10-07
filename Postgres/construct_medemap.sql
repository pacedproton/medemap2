-- Create new schema
CREATE SCHEMA IF NOT EXISTS medemap_aug;

-- Drop existing tables if they exist in the new schema
DROP TABLE IF EXISTS medemap_aug.demand_side_trust_in_media;
DROP TABLE IF EXISTS medemap_aug.demand_side_media_use;
DROP TABLE IF EXISTS medemap_aug.democracy;
DROP TABLE IF EXISTS medemap_aug.legal_framework_equality;
DROP TABLE IF EXISTS medemap_aug.legal_framework_freedom;
DROP TABLE IF EXISTS medemap_aug.legal_framework_human_dignity;
DROP TABLE IF EXISTS medemap_aug.legal_framework_pluralism;
DROP TABLE IF EXISTS medemap_aug.legal_framework_rule_of_law;
DROP TABLE IF EXISTS medemap_aug.supply_side;

-- Create tables with updated schemas in the new schema

CREATE TABLE medemap_aug.demand_side_media_use (
    year INT,
    country VARCHAR(255),
    watching_tv NUMERIC,
    meta_watching_tv JSONB,
    watching_tv_online NUMERIC,
    meta_watching_tv_online JSONB,
    listening_radio NUMERIC,
    meta_listening_radio JSONB,
    reading_press NUMERIC,
    meta_reading_press JSONB,
    reading_online_news NUMERIC,
    meta_reading_online_news JSONB,
    using_social_media NUMERIC,
    meta_using_social_media JSONB,
    following_influencers NUMERIC,
    meta_following_influencers JSONB,
    identifying_disinformation_high NUMERIC,
    meta_identifying_disinformation_high JSONB,
    identifying_disinformation_some NUMERIC,
    meta_identifying_disinformation_some JSONB,
    digital_technologies_i NUMERIC,
    meta_digital_technologies_i JSONB,
    digital_technologies_ii NUMERIC,
    meta_digital_technologies_ii JSONB
);

CREATE TABLE medemap_aug.demand_side_trust_in_media (
    year INT,
    country VARCHAR(255),
    trust_media NUMERIC,
    meta_trust_media JSONB,
    trust_information NUMERIC,
    meta_trust_information JSONB,
    trust_media_covid NUMERIC,
    meta_trust_media_covid JSONB,
    trust_tv NUMERIC,
    meta_trust_tv JSONB,
    trust_radio NUMERIC,
    meta_trust_radio JSONB,
    trust_press NUMERIC,
    meta_trust_press JSONB,
    trust_internet NUMERIC,
    meta_trust_internet JSONB,
    trust_social_media NUMERIC,
    meta_trust_social_media JSONB,
    special_trust_psb NUMERIC,
    meta_special_trust_psb JSONB,
    special_trust_private_broadcasting NUMERIC,
    meta_special_trust_private_broadcasting JSONB,
    special_trust_press NUMERIC,
    meta_special_trust_press JSONB,
    special_trust_news_platforms NUMERIC,
    meta_special_trust_news_platforms JSONB,
    special_trust_video_platforms NUMERIC,
    meta_special_trust_video_platforms JSONB,
    special_trust_followed_people NUMERIC,
    meta_special_trust_followed_people JSONB,
    special_trust_influencers NUMERIC,
    meta_special_trust_influencers JSONB
);

CREATE TABLE medemap_aug.democracy (
    year INT,
    country VARCHAR(255),
    electoral_dem NUMERIC,
    meta_electoral_dem JSONB,
    liberal_dem NUMERIC,
    meta_liberal_dem JSONB,
    participatory_dem NUMERIC,
    meta_participatory_dem JSONB,
    deliberative_dem NUMERIC,
    meta_deliberative_dem JSONB,
    egalitarian_dem NUMERIC,
    meta_egalitarian_dem JSONB,
    eiu_dem_index NUMERIC,
    meta_eiu_dem_index JSONB,
    electoral_process NUMERIC,
    meta_electoral_process JSONB,
    government_function NUMERIC,
    meta_government_function JSONB,
    fundament_rights NUMERIC,
    meta_fundament_rights JSONB,
    civil_liberties NUMERIC,
    meta_civil_liberties JSONB,
    pol_culture NUMERIC,
    meta_pol_culture JSONB,
    civil_society NUMERIC,
    meta_civil_society JSONB,
    pol_participation NUMERIC,
    meta_pol_participation JSONB,
    civic_participation NUMERIC,
    meta_civic_participation JSONB
);

CREATE TABLE medemap_aug.legal_framework_equality (
    year INT,
    country VARCHAR(255),
    social_equality NUMERIC,
    meta_social_equality JSONB,
    representation_minorities NUMERIC,
    meta_representation_minorities JSONB,
    gender_equality NUMERIC,
    meta_gender_equality JSONB,
    representation_women NUMERIC,
    meta_representation_women JSONB,
    transparency_subsidies NUMERIC,
    meta_transparency_subsidies JSONB,
    media_literacy NUMERIC,
    meta_media_literacy JSONB
);

CREATE TABLE medemap_aug.legal_framework_freedom (
    year INT,
    country VARCHAR(255),
    freedom_expression_i NUMERIC,
    meta_freedom_expression_i JSONB,
    freedom_expression_ii NUMERIC,
    meta_freedom_expression_ii JSONB,
    freedom_expression_iii NUMERIC,
    meta_freedom_expression_iii JSONB,
    media_freedom_rsf_index NUMERIC,
    meta_media_freedom_rsf_index JSONB,
    media_freedom_ii NUMERIC,
    meta_media_freedom_ii JSONB,
    transparency_ownership NUMERIC,
    meta_transparency_ownership JSONB,
    journalism_protection_legal NUMERIC,
    meta_journalism_protection_legal JSONB,
    journalism_protection_pol NUMERIC,
    meta_journalism_protection_pol JSONB,
    independence_from_state_i NUMERIC,
    meta_independence_from_state_i JSONB,
    independence_from_state_ii NUMERIC,
    meta_independence_from_state_ii JSONB,
    right_information_i NUMERIC,
    meta_right_information_i JSONB,
    right_information_ii NUMERIC,
    meta_right_information_ii JSONB
);

CREATE TABLE medemap_aug.legal_framework_human_dignity (
    year INT,
    country VARCHAR(255),
    safety_journalists NUMERIC,
    meta_safety_journalists JSONB,
    harassment_protection_i NUMERIC,
    meta_harassment_protection_i JSONB,
    harassment_protection_ii NUMERIC,
    meta_harassment_protection_ii JSONB
);

CREATE TABLE medemap_aug.legal_framework_pluralism (
    year INT,
    country VARCHAR(255),
    market_plurality_eco NUMERIC,
    meta_market_plurality_eco JSONB,
    market_plurality_i NUMERIC,
    meta_market_plurality_i JSONB,
    market_plurality_ii NUMERIC,
    meta_market_plurality_ii JSONB,
    commercial_independence NUMERIC,
    meta_commercial_independence JSONB,
    pluralism_views_i NUMERIC,
    meta_pluralism_views_i JSONB,
    editorial_autonomy NUMERIC,
    meta_editorial_autonomy JSONB,
    psb_independence NUMERIC,
    meta_psb_independence JSONB
);

CREATE TABLE medemap_aug.legal_framework_rule_of_law (
    year INT,
    country VARCHAR(255),
    rule_of_law NUMERIC,
    meta_rule_of_law JSONB,
    independence_media_authority NUMERIC,
    meta_independence_media_authority JSONB
);

CREATE TABLE medemap_aug.supply_side (
    year INT,
    country VARCHAR(255),
    media_market_viability NUMERIC,
    meta_media_market_viability JSONB,
    market_plurality_i NUMERIC,
    meta_market_plurality_i JSONB,
    market_plurality_ii NUMERIC,
    meta_market_plurality_ii JSONB,
    transparency_ownership NUMERIC,
    meta_transparency_ownership JSONB,
    transparency_subsidies NUMERIC,
    meta_transparency_subsidies JSONB,
    independence_from_state_i NUMERIC,
    meta_independence_from_state_i JSONB,
    independence_from_state_ii NUMERIC,
    meta_independence_from_state_ii JSONB,
    psb_independence NUMERIC,
    meta_psb_independence JSONB,
    psb_revenues NUMERIC,
    meta_psb_revenues JSONB,
    psb_funding NUMERIC,
    meta_psb_funding JSONB,
    local_media NUMERIC,
    meta_local_media JSONB,
    representation_minorities NUMERIC,
    meta_representation_minorities JSONB,
    representation_women NUMERIC,
    meta_representation_women JSONB
);

-- Import data from CSV files into the new schema
COPY medemap_aug.demand_side_media_use FROM '/var/lib/pgsql/import2/Demand side - Media use-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.demand_side_trust_in_media FROM '/var/lib/pgsql/import2/Demand side - Trust in media-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.democracy FROM '/var/lib/pgsql/import2/Democracy & Participation-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.legal_framework_equality FROM '/var/lib/pgsql/import2/Legal Framework - Equality-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.legal_framework_freedom FROM '/var/lib/pgsql/import2/Legal Framework - Freedom-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.legal_framework_human_dignity FROM '/var/lib/pgsql/import2/Legal Framework - Human Dignity-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.legal_framework_pluralism FROM '/var/lib/pgsql/import2/Legal Framework - Pluralism-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.legal_framework_rule_of_law FROM '/var/lib/pgsql/import2/Legal Framework - Rule of Law-Table 1.csv' WITH CSV HEADER;
COPY medemap_aug.supply_side FROM '/var/lib/pgsql/import2/Supply side-Table 1.csv' WITH CSV HEADER;