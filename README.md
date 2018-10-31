# Insight 2 Impact (i2i)


## Requirements
* `ruby 2.3.3`
* `postgresql 9.6`

## Installation
To install the required `ruby` version is recommended to use a ruby version manager like [RVM](https://rvm.io/) or [rbenv](https://github.com/rbenv/rbenv).

Once `ruby` is installed, run `gem install bundler` if you don't have `bundler` already installed and `bundle install` to install the required dependencies.

Finally, install node packages by running `npm install`.

### Database setup
Having `postgresql` already installed, run `rails db:create` if you haven't created the database.

Run `rails db:migrate`, `rails db:seed`, and `rails db:sample`.

## Configuration :floppy_disk:
Copy the file *.env.sample* as *.env* and change it according to your database configuration

## Code Quality :white_check_mark:
For the time being, we are using the next tools to keep quaity and consistency of the code:

* [sass-lint](https://github.com/brigade/scss-lint)

To install `sass-lint` run `npm install -g sass-lint`. This is a **editor-based** tool, you will need to setup your editor with the proper linter.

## Development
Start `postgresql` server.

Run `rails s` to start the server.

Go to [localhost](http://localhost:3000) and have fun :collision: :tada:

## Troubleshooting :interrobang:
If you have `postgresql` installed via [Homebrew](http://brew.sh/) probably the user setted is your account name. `rails db:create` command asks for a `postgres` user.

To check this, enter in a `postgresql` console and type `\du` you will see the list of roles/users. If `postgres` is already there you have nothing to do, otherwise, you will need to create a new `postgres` role running the next command:

	createuser -sPE postgres

Set a password for this role/user. Once you are done, you should be able to create the database with `postgres` role.

## Shareable components

Because we need to be able to share some components outside the project, there is a new Rails environment called `assets_compilation`. This environment is a duplicated of the `production` one with other rules added.

In order to compile those assets, run `RAILS_ENV=assets_compilation SECRET_KEY_BASE=secret rake assets:precompile`. This will place all precompiled asssets in `public` folder. Once done, run `rake non_digested RAILS_ENV=assets_compilation SECRET_KEY_BASE=secret`. This task will create duplicate of current compiled files but removing its hash, making it easier to manage. For example: `exported_componentes#mfnhf21378kjashjads1234.js` would be `exported_componentes.js`

# Using docker in development

```
docker-compose -f docker-compose-dev.yml up --build`
```

It will fails because database has not been creted. So you have to run:

```
docker-compose -f docker-compose-dev.yml run web rake db:create db:migrate
```

and repeat first command:

```
docker-compose -f docker-compose-dev.yml up --build
```

## Adding new national surveys

- Post the data to the node api
- Create the country on the application if the country doesn't exist
- Add the country flag as a `svg` to `public/images/flags/ISO.svg`

## Importing financial diaries data (csv)

The csvs must be properly formatted with the columns containing descriptive data (eg: `category_name`, `subcategory`), these columns will vary depending on the type of data being imported (`houshold_transactions` or `household_member_transactions`). The values must have a date header (eg: `2017-12`) and it's content must be 10 values separated by a colon: `160:40:0:160:null:0:null:null:null:null`.

Values can be `0`, `null`, or a `float`.

The 10 values correspond respectively to:

    total_transaction_value
    avg_value
    min_value
    max_value
    rolling_balance
    business_expenses
    withdrawals
    deposits
    new_borrowing
    repayment

Everything is imported locally using rake tasks, the tasks that read from files read them from `db/data/...` so you just want to replace/rename your file or the path.

Another important thing to change on the tasks is to look for the places accessing the values columns by index (eg: `row[10..74]`), this changes from dataset to dataset so just set the indexes to match the first column with a date to the last one.

The tasks are all in a single filed named `import_financial_diaries`, the commented tasks at the bottom were originally created to address specific problems with the first ever dataset, so it shouldn't be part of the flow, the csv should be properlly populated to begin with.

The import is made locally against a backup of the production database to test if it all works, and then you can restore the whole database or just the financial diaries tables.
