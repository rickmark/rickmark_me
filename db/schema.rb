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

ActiveRecord::Schema.define(version: 20100601051327) do

  create_table "articles", force: :cascade do |t|
    t.string   "subject"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "hidden"
  end

  create_table "projects", force: :cascade do |t|
    t.string   "name"
    t.string   "project_page"
    t.string   "source_control_type"
    t.string   "source_control_url"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "active"
    t.string   "demo_url"
  end

  create_table "tag_usages", force: :cascade do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "taggable_type"
  end

  create_table "tags", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
