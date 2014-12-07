# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20141207210656) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "lines", force: true do |t|
    t.string   "line"
    t.string   "mta_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color"
  end

  create_table "stations", force: true do |t|
    t.string   "name"
    t.string   "mta_id"
    t.float    "lat"
    t.float    "lng"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "stops", force: true do |t|
    t.integer  "station_id"
    t.integer  "line_id"
    t.integer  "numeric"
    t.integer  "station_north"
    t.integer  "station_south"
    t.integer  "time_north"
    t.integer  "time_south"
    t.integer  "delay"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
