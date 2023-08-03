
ALTER DATABASE dataentry_app SET timezone TO 'UTC';
ALTER DATABASE tests SET timezone TO 'UTC';

DROP VIEW IF EXISTS release_line_age;
DROP TABLE IF EXISTS "releases";

CREATE TABLE "releases" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "builds";
CREATE TABLE "builds" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "release_selections";
CREATE TABLE "release_selections" (
    "id" SERIAL NOT NULL,
    "build_id" INTEGER NOT NULL,
    "release_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_selections_pkey" PRIMARY KEY ("id")
);


CREATE VIEW release_line_age AS
    SELECT
    rs.release_id AS id,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', b.id,
            'name', b.name
        )
    ) AS builds
FROM
    release_selections rs
JOIN releases r ON r.id = rs.release_id
JOIN builds b ON b.id = rs.build_id
GROUP BY rs.release_id
ORDER BY rs.release_id;