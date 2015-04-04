<?php
    require_once '../util/ajax.php';
    require_once '../util/session.php';

    $post_user_id = ajax_arg('user_id', FILTER_UNSAFE_RAW, null);

    $auth_user_id = session_get('auth_user_id');

    if ($auth_user_id && $post_user_id === $auth_user_id) {
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
