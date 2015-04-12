<?php
    require_once 'db.php';

    // db actions of catalogs

    function db_cat_init() {
        global $db_conn;

        // catalogs
        //     cat_count: no more than 50
        return $db_conn->query('
            create table cat (
                cat_id          bigint          auto_increment  primary key,
                parent_cat_id   bigint          not null,

                name            varchar(64)     unique,
                image           varchar(64),
                detail          text,

                cat_count       bigint          not null,
                book_count      bigint          not null
            );
        ');
    }

    function db_cat_truncate() {
        global $db_conn;

        return $db_conn->query('
            truncate table cat;
        ');
    }

    function db_cat_add(
        $parent_cat_id,
        $name, $image, $detail
    ) {
        return db_insert(
            'cat',
            null, $parent_cat_id,
            $name, $image, $detail,
            0, 0
        ) && ($parent_cat_id === 0 || db_update(
            'cat',
            'cat_id', $parent_cat_id,
            'cat_count = cat_count + 1'
        ));
    }

    function db_cat_get($cat_id) {
        return db_select('cat', 'cat_id', $cat_id)->fetch_assoc();
    }

    function db_cat_get_name($name) {
        return db_select('cat', 'name', $name)->fetch_assoc();
    }

    function db_cat_list_parent(
        $cat_id,
        $begin, $count = 50
    ) {
        return db_select(
            'cat', 'parent_cat_id', $cat_id,
            null, true, $begin, $count
        );
    }

    // function db_cat_set($data) {
    //     return db_write('cat', $data, true);
    // }
?>
