<?php
    require_once 'db.php';

    // db actions of books

    function db_book_init() {
        global $db_conn;

        // books to sell
        //     inventory: auto decrease + edit by user
        return $db_conn->query('
            create table book (
                book_id         bigint          auto_increment  primary key,
                owner_user_id   bigint          not null,
                parent_cat_id   bigint          not null,

                name            varchar(64),
                image           varchar(64),
                detail          text,
                price           varchar(64),
                inventory       bigint,

                sold_count      bigint,

                date_create     datetime
            );
        ');
    }

    function db_book_truncate() {
        global $db_conn;

        return $db_conn->query('
            truncate table book;
        ');
    }

    function db_book_add(
        $owner_user_id, $parent_cat_id,
        $name, $image, $detail, $price, $inventory
    ) {
        return db_insert(
            'book',
            null, $owner_user_id, $parent_cat_id,
            $name, $image, $detail, $price, $inventory,
            0,
            date('Y-m-d H:i:s')
        );
    }

    function db_book_get($book_id) {
        return db_select('book', 'book_id', $book_id)->fetch_assoc();
    }

    function db_book_list_owner(
        $user_id,
        $begin, $count = 50, $order = null, $desc = true
    ) {
        return db_select(
            'book', 'owner_user_id', $user_id, $begin, $count, $order, $desc
        );
    }

    function db_book_list_cat(
        $cat_id,
        $begin, $count = 50, $order = null, $desc = true
    ) {
        return db_select(
            'book', 'parent_cat_id', $cat_id, $begin, $count, $order, $desc
        );
    }

    function db_book_set($data) {
        return db_write('book', $data, true);
    }
?>
