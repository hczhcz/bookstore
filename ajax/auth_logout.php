<?php
    require_once '../util/ajax.php';
    require_once '../util/session.php';

    // do logout
    // args: user_id

    $post_user_id = intval(ajax_arg('user_id', FILTER_VALIDATE_REGEXP, $filter_number));

    $auth_user_id = session_get('auth_user_id');

    if ($auth_user_id !== null && $post_user_id === intval($auth_user_id)) {
        // logout ok

        $auth_success = true;

        session_delete('auth_user_id');
    } else {
        // wrong id

        $auth_success = false;
    }

    echo ajax_gen(
        'auth_success', $auth_success
    );
?>
