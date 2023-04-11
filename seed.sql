INSERT INTO builds (
    id,
    name,
    requires_review,
    start_date,
    end_date,
    created_at,
    updated_at
) VALUES
    (1, 'Initial build', FALSE, '2020-01-01', '2020-06-01', now(), now()),
    (2, 'Automated build 1', FALSE, '2020-05-01', '2020-10-01', now(), now()),
    (3, 'Manual build 1', FALSE, '2020-02-01', '2020-03-01', now(), now()),
    (4, 'Automated build 2', FALSE, '2020-10-01', '2021-01-01', now(), now()),
    (5, 'Automated build 3', FALSE, '2021-01-01', '2021-06-01', now(), now()),
    (6, 'Manual build 2', FALSE, '2021-01-01', '2021-02-01', now(), now()),
    (7, 'Manual build 3', FALSE, '2021-05-01', '2021-06-01', now(), now()),
    (8, 'Automated build 4', FALSE, '2021-06-01', '2021-12-01', now(), now()),
    (9, 'Automated build 5', FALSE, '2022-01-01', '2022-03-01', now(), now()),
    (10, 'Automated build 6', FALSE, '2022-03-01', '2022-10-01', now(), now())
;




INSERT INTO releases (
    id,
    parent_id,
    name,
    status,
    created_at,
    updated_at,
    published_at
) VALUES
    (1, null::int, 'First release', 'PREVIOUS', '2022-01-01T00:00:00Z', '2022-01-01T00:00:00Z', '2022-01-01T00:00:00Z'),
    (2, 1, 'Second release', 'PREVIOUS', '2022-01-03T00:00:00Z', '2022-01-03T00:00:00Z', '2022-01-03T00:00:00Z'),
    (3, 2, 'Third release', 'PREVIOUS', '2022-01-06T00:00:00Z', '2022-01-06T00:00:00Z', '2022-01-06T00:00:00Z'),
    (4, 2, 'Fourth release', 'PREVIOUS', '2022-01-10T00:00:00Z', '2022-01-10T00:00:00Z', '2022-01-10T00:00:00Z'),
    (5, 4, 'Fifth release', 'PREVIOUS', '2022-03-01T00:00:00Z', '2022-03-01T00:00:00Z', '2022-03-01T00:00:00Z'),
    (6, 5, 'Sixth release', 'LIVE', '2022-12-01T00:00:00Z', '2022-12-01T00:00:00Z', '2022-12-01T00:00:00Z'),
    (7, 6, 'Seventh release', 'DRAFT', '2022-12-03T00:00:00Z', '2022-12-03T00:00:00Z', '2022-12-03T00:00:00Z')
;


INSERT INTO release_selections (
    id,
    build_id,
    release_id,
    status,
    start_date,
    end_date,
    created_at,
    updated_at
) VALUES
    (1, 1, 1, 'ACTIVE', '2020-01-01', '2020-05-01', '2022-01-01T00:00:00Z', '2022-01-01T00:00:00Z'),
    (2, 2, 2, 'ACTIVE', '2020-05-01', '2020-10-01', '2022-01-03T00:00:00Z', '2022-01-03T00:00:00Z'),
    (3, 3, 3, 'ACTIVE', '2020-02-01', '2020-03-01', '2022-01-06T00:00:00Z', '2022-01-06T00:00:00Z'),
    (4, 4, 3, 'ACTIVE', '2020-11-01', '2021-01-01', '2022-01-06T00:00:00Z', '2022-01-06T00:00:00Z'),
    (5, 5, 4, 'ACTIVE', '2021-01-01', '2021-06-01', '2022-01-10T00:00:00Z', '2022-01-10T00:00:00Z'),
    (6, 6, 4, 'ACTIVE', '2021-01-01', '2021-02-01', '2022-01-10T00:00:00Z', '2022-01-10T00:00:00Z'),
    (7, 7, 5, 'ACTIVE', '2021-05-01', '2021-06-01', '2022-03-01T00:00:00Z', '2022-03-01T00:00:00Z'),
    (8, 8, 6, 'ACTIVE', '2021-06-01', '2021-12-01', '2022-12-01T00:00:00Z', '2022-12-01T00:00:00Z'),
    (9, 9, 7, 'ACTIVE', '2022-01-01', '2022-03-01', '2022-12-03T00:00:00Z', '2022-12-03T00:00:00Z'),
    (10, 10, 7, 'ACTIVE', '2022-03-01', '2022-10-01', '2022-12-03T00:00:00Z', '2022-12-03T00:00:00Z')
;