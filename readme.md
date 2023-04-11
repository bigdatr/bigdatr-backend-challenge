# Bigdatr backend code challenge

## Setup

First up, run `yarn install` to install all dependencies.

To start up the postgres db via docker compose, run `yarn db:up`

Then to create the databases for local and testing run:

```
createdb -p 5439 -h localhost -U dataentry_app -e dataentry
```

and

```
createdb -p 5439 -h localhost -U dataentry_app -e tests
```

when prompted for a password use `dataentry_app`

Then to create the database tables and a add a bit of test data run:

```
yarn setup
```

#### Running the local server

To run the local server, run `yarn start`

#### Running tests

To run the tests run `yarn test`

## Project background

The code here is an excerpt from BigDatr's Media Value Tool which is a part of our larger Data Entry system.
Media Value is one of the core products that Bigdatr offers. It is a data set that shows our customers how much money was spent on advertising over time, broken down by brand, industry etc.

### Data structure

The media value data is computed in chunks of time, each computation of media value for a chunk of time is called a `build`. Multiple of these builds are then combined into a `release`, once media value is released it is important that it doesn't change historically so rather than each release re-specifying all the builds that make it up, each release is created based on a previous release. This is represented by the `parent_id` column on the `releases` table.

So if release `4` has a parent of release `3`, and release `3` has build `2` attached, then release `4` inherits build `2` from release `3`.

Builds are attached to releases via the `release_selections` table. This table defines which build(s) are attached to which releases, and what subset of time of the build is used.

For simplicity, the actual media value data is excluded from this project, it only includes the tables for builds, releases and release selections.

### Project setup

The code included here is a modified and cut down version of our data entry tool, the actual data entry tool runs on AWS Lambda and the infrastructure is managed by [sst](https://docs.sst.dev/).

-   The API handlers are in the `api` folder.
-   All logic for builds and releases is within the `models` folder for each
-   The API has a single POST request endpoint at `/rpc`. This is a simple system inspired by trpc that allows us to maintain type safety between the API and client. We've recently started using this rather than graphql as it requires less doubling up on type definitions. All models offer an `asPrimitive` method that returns data that is safe to JSON stringify in the response.

#### Tests

There are only integration tests for the api at the moment, they are in the `src/api/__tests__/` folder.

## The task

It is important for us to know exactly which builds are included in a release, both directly attached, and inherited via the parent system. Seeing as a release can have a parent, which can have a parent, which can have a parent and so on, this chain will get quite long over time and it will be infeasable to trace the lineage of a release.

To resolve this, you are tasked with adding a new api endpoint to releases called `releaseLineage`. This should return a list of builds that are both directly and indirectly attached to the release.

It should:

-   Include both the build, and the release that the build was attached to
-   Be ordered first by descending release id, and second by descending build id, so that newest releases are first in the list.

Please only spend about an hour on this task, we are conscious of not taking too much of your time. It is totally fine if you are unable to finish within an hour, the purpose of this exercise is to give us a specific technical problem to discuss, not to have a finished, fully working feature.
