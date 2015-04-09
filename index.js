'use strict';

// -------- login --------

var login_user_id = undefined;
var login_name = undefined;

// calculate 1-layer hashed password
var crypt_password = function (name, password_raw) {
    var SHA = new jsSHA(name + ':' + password_raw, 'TEXT');
    return SHA.getHash('SHA-256', 'HEX');
};

// calculate 2-layer (basic + salted) hashed password
var crypt_salt = function (password, salt) {
    var SHA = new jsSHA(password + salt, 'TEXT');
    return SHA.getHash('SHA-256', 'HEX');
};

var login_need_show = function () {
    $('.login_need').css('display', 'block');
    $('.login_ok').css('display', 'none');
};

var login_ok_show = function () {
    $('.login_need').css('display', 'none');
    $('.login_ok').css('display', 'block');
};

var login_update = function () {
    if (login_user_id) {
        $('#text_name').text(login_name);
        login_ok_show();
    } else {
        login_need_show();
    }
};

// -------- ajax --------

var ajax_auto_login = function () {
    $.post(
        'ajax/auth_get.php',
        {},
        function (data) {
            if (data['auth_user_id']) {
                login_user_id = data['auth_user_id'];
                login_name = data['auth_name'];

                login_update();
                content_update();
            } else {
                login_update();
                content_update();
            }
        },
        'json'
    );
};

var ajax_login = function (i_name, i_pass) {
    $.post(
        'ajax/auth_gen.php',
        {},
        function (data) {
            $.post(
                'ajax/auth_login.php',
                {
                    name: i_name,
                    password: crypt_salt(
                        crypt_password(i_name, i_pass),
                        data['auth_salt']
                    ),
                },
                function (data) {
                    if (data['auth_success']) {
                        login_user_id = data['auth_user_id'];
                        login_name = data['auth_name'];

                        login_update();
                        content_update();
                    } else {
                        if (data['auth_name']) {
                            // TODO: wrong password
                        } else {
                            // TODO: wrong name
                        }
                    }
                },
                'json'
            );
        },
        'json'
    );
};

var ajax_logout = function () {
    $.post(
        'ajax/auth_logout.php',
        {
            user_id: login_user_id,
        },
        function (data) {
            if (data['auth_success']) {
                login_user_id = undefined;
                login_name = undefined;

                login_update();
                content_update();
            } else {
                // TODO: internal error
            }
        },
        'json'
    );
};

var ajax_cat_info = function (id) {
    $.post(
        'ajax/cat.php',
        {
            cat_id: id,
        },
        function (data) {
            if (data['get_success']) {
                page_switch(data['name']);
                intro_show(
                    data['image'],
                    data['name'],
                    data['detail']
                );
            }
        },
        'json'
    );
};

var ajax_book_info = function (id) {
    $.post(
        'ajax/book.php',
        {
            book_id: id,
        },
        function (data) {
            if (data['get_success']) {
                page_switch(data['name']);
                intro_show(
                    data['image'],
                    data['name'],
                    data['detail'] + '\n\n**价格：**'
                    + data['price'] + '\n\n**已售：**'
                    + data['sold'] + '\n\n**库存：**'
                    + data['inventory']
                );
            }
        },
        'json'
    );
};

var ajax_cat_cat = function (id) {
    $.post(
        'ajax/cat_cat.php',
        {
            cat_id: id,
            begin: 0,
        },
        function (data) {
            var idata = [];

            for (var i in data['data']) {
                var cat_info = data['data'][i];

                idata.push({
                    big: false,
                    href: '#!cat-' + cat_info['cat_id'],
                    click: function () {},
                    title: cat_info['name'],
                    text: cat_info['detail'],
                });
            }

            view_isotope_insert(idata);
        },
        'json'
    );
};

var ajax_cat_book = function (id) {
    $.post(
        'ajax/cat_book.php',
        {
            book_id: id,
            begin: 0,
        },
        function (data) {
            var idata = [];

            for (var i in data['data']) {
                var book_info = data['data'][i];

                idata.push({
                    big: true,
                    href: '#!book-' + book_info['book_id'],
                    click: function () {},
                    title: book_info['name'],
                    text: book_info['detail'] + '\n\n**价格：**'
                        + book_info['price'] + '\n\n**已售：**'
                        + book_info['sold'] + '\n\n**库存：**'
                        + book_info['inventory'],
                });
            }

            view_isotope_insert(idata);
        },
        'json'
    );
};

// -------- header --------

// add event handlers
$(function () {
    $('#btn_logout').click(function () {
        ajax_logout();
    });

    $('#input_name').keypress(function (e) {
        if (e.which === 13) {
            $('#input_password').focus();
        }
    });

    $('#input_password').keypress(function (e) {
        if (e.which === 13) {
            $('#btn_login').click();
        }
    });

    $('#btn_login').click(function () {
        var i_name = $('#input_name').val();
        var i_pass = $('#input_password').val();
        $('#input_password').val('');

        ajax_login(i_name, i_pass);
    });
});

// -------- navigation --------

var page_prepare = function () {
    document.title = 'Yet Another Bookstore';
};

var page_switch = function (title) {
    if (title) {
        document.title = title + ' - Yet Another Bookstore';
    } else {
        document.title = 'Yet Another Bookstore';
    }
};

// -------- intro --------

var intro_hide = function () {
    $('#intro').css('display', 'none');
};

var intro_show = function (image, title, text) {
    $('#intro_image').css('display', 'none');

    if (image) {
        $.get(
            'upload/' + image,
            {},
            function (data) {
                $('#intro_image').attr('src', data);
                $('#intro_image').css('display', 'block');
            },
            'text'
        );
    }

    $('#intro_title').html(markdown.toHTML(title));
    $('#intro_text').html(markdown.toHTML(text));

    $('#intro').css('display', 'block');
};

// -------- view --------

var view_hide = function (action) {
    $('#content').stop().animate({
        opacity: 0,
    }, 200, function () {
        $('#content').css('display', 'none');
        action();
    });
};

var view_switch = function (name) {
    $('.view').css('display', 'none');

    $('#view_' + name).css('display', 'block');
    $('#content').css('display', 'block');

    $('#content').stop().animate({
        opacity: 1,
    }, 200);
};

var view_isotope_init = function () {
    $('#view_isotope').isotope({
        layoutMode: 'masonry',
        itemSelector: '.isotope, .isotope_big',
        transitionDuration: '0.2s',
    });
};

var view_isotope_reset = function () {
    $('#view_isotope').isotope('destroy');
    $('#view_isotope').empty();

    view_isotope_init();
};

var view_isotope_insert = function (data) {
    for (var i in data) {
        $('#view_isotope').isotope('insert',
            $('<div />')
                .addClass(data[i]['big'] ? 'isotope_big' : 'isotope')
                .append(
                    $('<a />')
                        .addClass('isotope_inner')
                        .addClass('frame_body')
                        .attr('href', data[i]['href'])
                        .click(data[i]['click'])
                        .append(
                            $('<div />')
                                .addClass('title')
                                .html(markdown.toHTML(data[i]['title']))
                        )
                        .append(
                            $('<div />')
                                .addClass('normal')
                                .html(markdown.toHTML(data[i]['text']))
                        )
                )
                .appendTo('#view_isotope')
        )
    }
};

// click event handler of view_submit
var submit_func = undefined;

var view_submit_init = function () {
    $('#submit_button').click(function () {
        submit_func();
    });
};

var view_submit = function (handler, rows) {
    $('#submit_table').empty();

    for (var i in rows) {
        var checker = function (i) {
            if (rows[i]['checker']) {
                return function () {
                    var target = $('#submit_' + i + ' input');

                    $('#submit_' + i)
                        .find('.submit_hint')
                        .empty()
                        .append(
                            rows[i]['checker'](target.val(), i)
                        );
                };
            } else {
                return function () {};
            }
        } (i);

        $('#submit_table').append(
            $('<tr />')
                .attr('id', 'submit_' + i)
                .append($('<td />').append(
                    $('<p />')
                        .addClass('submit_name')
                        .html(rows[i]['name'])
                ))
                .append($('<td />').append(
                    $('<input />')
                        .addClass('submit_input')
                        .attr('id', 'submit_input_' + rows[i]['key'])
                        .attr('type', rows[i]['type'])
                        .keypress(function () {
                            var target = $('#submit_' + (parseInt(i) + 1) + ' input');

                            if (target) {
                                target.focus();
                            }
                        })
                        .change(checker)
                ))
                .append($('<td />').append(
                    $('<p />')
                        .addClass('submit_hint')
                ))
        );
    }

    // set the handler
    submit_func = function () {
        // check error again
        $('#submit_table input').change();

        if ($('#submit_table .error').length > 0) {
            // TODO: error
            return;
        }

        var arg = {};

        for (var i in rows) {
            if (rows[i]['key']) {
                var target = $('#submit_' + i + ' input');

                if (rows[i]['generator']) {
                    arg[rows[i]['key']] = rows[i]['generator'](target.val(), i);
                } else {
                    arg[rows[i]['key']] = target.val();
                }
            }
        }

        handler(arg);
    }
};

// -------- content --------

// parse location.hash and load a page
var content_update = function (go) {
    if (go) {
        window.location.hash = go;
    }

    if (!window.location.hash) {
        window.location.hash = '#!home';
    }

    view_hide(function () {
        // reset title
        page_prepare();
        intro_hide();

        switch (window.location.hash) {
            case '#!home':
                view_isotope_reset();
                view_switch('isotope');

                // TODO: load more than 50 items
                ajax_cat_cat(0);

                page_switch();

                break;
            case '#!explore':
                view_switch('isotope');

                page_switch('发现');

                break;
            case '#!stores':
                view_switch('isotope');

                page_switch('商家');

                break;
            case '#!orders':
                // view_switch('isotope');

                page_switch('订单');

                break;
            case '#!my':
                // view_switch('isotope');

                page_switch('我的');

                break;
            case '#!register':
                view_submit(
                    function (arg) {
                        $.post(
                            'ajax/auth_reg.php',
                            arg,
                            function (data) {
                                if (data['auth_success']) {
                                    login_user_id = data['auth_user_id'];
                                    login_name = data['auth_name'];

                                    login_update();
                                    content_update('#!home');
                                } else {
                                    // TODO: error
                                }
                            },
                            'json'
                        );
                    },
                    [{
                        key: 'mail',
                        name: '邮箱 *',
                        type: 'text',
                        checker: function (value, i) {
                            if (value.match(/^[^ ;@]+@[^ ;@]+\.[^ ;@]*$/ig)) {
                                return '';
                            } else {
                                return $('<p />')
                                    .addClass('error')
                                    .text('邮箱格式错误！');
                            }
                        },
                        generator: undefined,
                    },
                    {
                        key: 'name',
                        name: '用户名 *',
                        type: 'text',
                        checker: function (value, i) {
                            if (value.length !== 0) {
                                return '';
                            } else {
                                return $('<p />')
                                    .addClass('error')
                                    .text('用户名不能为空！');
                            }
                        },
                        generator: undefined,
                    },
                    {
                        key: 'password',
                        name: '密码 *',
                        type: 'password',
                        checker: function (value, i) {
                            var target = $('#submit_' + (parseInt(i) + 1) + ' input');

                            if (value !== target.val()) {
                                target.val('');
                            }

                            if (value.length >= 6) {
                                return '';
                            } else {
                                return $('<p />')
                                    .addClass('error')
                                    .text('密码过短！');
                            }
                        },
                        generator: function (value, i) {
                            var target = $('#submit_' + (parseInt(i) - 1) + ' input');

                            return crypt_password(
                                target.val(),
                                value
                            );
                        },
                    },
                    {
                        key: '',
                        name: '确认密码 *',
                        type: 'password',
                        checker: function (value, i) {
                            var target = $('#submit_' + (parseInt(i) - 1) + ' input');
                            var value1 = target.val();

                            if (value1 === value) {
                                return '';
                            } else {
                                return $('<p />')
                                    .addClass('error')
                                    .text('密码不一致！');
                            }
                        },
                        generator: undefined,
                    },
                    {
                        key: 'location',
                        name: '所在地区 *',
                        type: 'text',
                        checker: function (value, i) {
                            if (value.length !== 0) {
                                return '';
                            } else {
                                return $('<p />')
                                    .addClass('error')
                                    .text('所在地区不能为空！');
                            }
                        },
                        generator: undefined,
                    },
                    {
                        key: 'address',
                        name: '收货地址 <small>[1]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: function (value, i) {
                            var target = $('#submit_' + (parseInt(i) + 1) + ' input');
                            var line = target.val();

                            if (line) {
                                value += '\n\n' + line;
                            }

                            return value;
                        },
                    },
                    {
                        key: undefined,
                        name: '<small>[2]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: undefined,
                    },
                    {
                        key: 'detail',
                        name: '自我介绍 <small>[1]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: function (value, i) {
                            for (var j = 1; j <= 5; ++j) {
                                var target = $('#submit_' + (parseInt(i) + j) + ' input');
                                var line = target.val();

                                if (line) {
                                    value += '\n\n' + line;
                                }
                            }

                            return value;
                        },
                    },
                    {
                        key: undefined,
                        name: '<small>[2]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: undefined,
                    },
                    {
                        key: undefined,
                        name: '<small>[3]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: undefined,
                    },
                    {
                        key: undefined,
                        name: '<small>[4]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: undefined,
                    },
                    {
                        key: undefined,
                        name: '<small>[5]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: undefined,
                    },
                    {
                        key: undefined,
                        name: '<small>[6]</small>',
                        type: 'text',
                        checker: undefined,
                        generator: undefined,
                    },]
                );
                view_switch('submit');

                page_switch('注册');

                break;
            default:
                var arg = window.location.hash.split('-');

                switch (arg[0]) {
                    case '#!user':
                        // view_switch('isotope');

                        // page_switch('');

                        break;
                    case '#!cat':
                        view_isotope_reset();
                        view_switch('isotope');

                        var cat_id = parseInt(arg[1]);

                        ajax_cat_info(cat_id);

                        // TODO: load more than 50 catalogs & books
                        ajax_cat_cat(cat_id);
                        ajax_cat_book(cat_id);

                        break;
                    case '#!book':
                        // TODO: a new view
                        view_isotope_reset();
                        view_switch('isotope');

                        var book_id = parseInt(arg[1]);

                        ajax_book_info(book_id);

                        break;
                    default:
                        // TODO: bad hashbang

                        break;
                }
                break;
        }
    });
};

$(window).on('hashchange', function () {
    content_update();
});

// -------- page init --------

$(function () {
    $.backstretch(['res/bg.jpg']);

    view_isotope_init();
    view_submit_init();

    ajax_auto_login();
});
