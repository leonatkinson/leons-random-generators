<?php
/**
 * Plugin Name: Leon's Random Generators
 * Description: Band names, album covers, lyrics, chords, jokes, advice, essays, comics, and a translator.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Text Domain: leons-random-generators
 */

if (!defined('ABSPATH')) {
    exit;
}

const LRG_OPTION = 'leons_random_generators_settings';

function lrg_settings() {
    $settings = get_option(LRG_OPTION, []);
    return is_array($settings) ? $settings : [];
}

function lrg_flickr_key() {
    $settings = lrg_settings();
    return isset($settings['flickr_api_key']) ? trim((string) $settings['flickr_api_key']) : '';
}

function lrg_asset($file) {
    $path = __DIR__ . '/build/' . $file;
    if (!file_exists($path)) {
        return null;
    }
    return [
        'url' => plugins_url('build/' . $file, __FILE__),
        'path' => $path,
        'version' => (string) filemtime($path),
    ];
}

function lrg_script_config() {
    return [
        'albumPhotoUrl' => rest_url('leons-random-generators/v1/album-photo'),
        'imagesUrl' => plugins_url('assets/images/', __FILE__),
        'settingsUrl' => admin_url('options-general.php?page=leons-random-generators'),
        'hasFlickrKey' => lrg_flickr_key() !== '',
    ];
}

function lrg_register_assets() {
    $editor = lrg_asset('index.js');
    $view = lrg_asset('view.js');
    $style = lrg_asset('style-index.css');
    $config = 'var leonsRandomGenerators = ' . wp_json_encode(lrg_script_config()) . ';';
    if ($editor) {
        $deps = ['wp-blocks', 'wp-element', 'wp-i18n'];
        $asset = __DIR__ . '/build/index.asset.php';
        if (file_exists($asset)) {
            $meta = include $asset;
            $deps = $meta['dependencies'];
        }
        wp_register_script('leons-random-generators-editor', $editor['url'], $deps, $editor['version'], true);
        wp_add_inline_script('leons-random-generators-editor', $config, 'before');
    }
    if ($view) {
        wp_register_script('leons-random-generators-view', $view['url'], [], $view['version'], true);
        wp_add_inline_script('leons-random-generators-view', $config, 'before');
    }
    if ($style) {
        wp_register_style('leons-random-generators-style', $style['url'], [], $style['version']);
        if (file_exists(__DIR__ . '/build/style-index-rtl.css')) {
            wp_style_add_data('leons-random-generators-style', 'rtl', 'replace');
        }
    }
}

add_action('init', function () {
    lrg_register_assets();
    $generators = [
        'band' => 'Band Names',
        'album' => 'Album Covers',
        'lyrics' => 'Song Lyrics',
        'song' => 'Chord Progressions',
        'jokes' => 'Jokes',
        'advice' => 'Advice',
        'essay' => 'Essays',
        'comic' => 'Comics',
        'translate' => 'Translator',
    ];
    foreach ($generators as $name => $title) {
        register_block_type('leons-random-generators/' . $name, [
            'title' => $title,
            'category' => 'leons-random-generators',
            'editor_script' => 'leons-random-generators-editor',
            'style' => 'leons-random-generators-style',
            'render_callback' => static function () use ($name) {
                return sprintf(
                    '<div class="wp-block-leons-random-generators-%1$s lrg-block" data-generator="%1$s"></div>',
                    esc_attr($name)
                );
            },
        ]);
    }
});

add_filter('block_categories_all', function ($categories) {
    array_unshift($categories, [
        'slug' => 'leons-random-generators',
        'title' => "Leon's Random Generators",
    ]);
    return $categories;
});

function lrg_content_has_block($content) {
    foreach ([
        'band', 'album', 'lyrics', 'song', 'jokes', 'advice', 'essay', 'comic', 'translate',
    ] as $name) {
        if (has_block('leons-random-generators/' . $name, $content)) {
            return true;
        }
    }
    return false;
}

add_action('wp_enqueue_scripts', function () {
    if (!is_singular()) {
        return;
    }
    $post = get_post();
    if (!$post || !lrg_content_has_block($post->post_content)) {
        return;
    }
    wp_enqueue_script('leons-random-generators-view');
    wp_enqueue_style('leons-random-generators-style');
});

add_action('rest_api_init', function () {
    register_rest_route('leons-random-generators/v1', '/album-photo', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'lrg_album_photo',
    ]);
});

function lrg_album_photo() {
    $key = lrg_flickr_key();
    if ($key === '') {
        return ['fallback' => true];
    }
    $list = get_transient('lrg_flickr_photos');
    if (!is_array($list)) {
        $list = lrg_fetch_flickr($key);
        if (!is_array($list)) {
            return ['fallback' => true];
        }
        set_transient('lrg_flickr_photos', $list, 3600);
    }
    if (count($list) === 0) {
        return ['fallback' => true];
    }
    $photo = $list[array_rand($list)];
    return [
        'src' => $photo['src'],
        'pageUrl' => $photo['pageUrl'],
    ];
}

function lrg_fetch_flickr($key) {
    $url = 'https://api.flickr.com/services/rest/?' . http_build_query([
        'method' => 'flickr.photos.search',
        'api_key' => $key,
        'extras' => 'license',
        'license' => '1,2,4,5,7',
        'min_upload_date' => gmdate('Y-m-d', time() - 14 * DAY_IN_SECONDS),
        'format' => 'json',
        'nojsoncallback' => 1,
        'per_page' => 500,
        'page' => 1,
    ]);
    $response = wp_remote_get($url, ['timeout' => 15]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return null;
    }
    $body = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($body) || ($body['stat'] ?? '') !== 'ok' || empty($body['photos']['photo'])) {
        return null;
    }
    $photos = [];
    foreach ($body['photos']['photo'] as $photo) {
        $license = (string) ($photo['license'] ?? '');
        if (!in_array($license, ['1', '2', '4', '5', '7'], true)) {
            continue;
        }
        if (empty($photo['farm']) || empty($photo['server']) || empty($photo['id']) || empty($photo['secret']) || empty($photo['owner'])) {
            continue;
        }
        $photos[] = [
            'src' => sprintf(
                'https://farm%s.static.flickr.com/%s/%s_%s.jpg',
                $photo['farm'],
                $photo['server'],
                $photo['id'],
                $photo['secret']
            ),
            'pageUrl' => sprintf('https://www.flickr.com/photos/%s/%s', $photo['owner'], $photo['id']),
        ];
    }
    return $photos;
}

add_action('admin_menu', function () {
    add_options_page(
        "Leon's Random Generators",
        "Leon's Random Generators",
        'manage_options',
        'leons-random-generators',
        'lrg_render_settings'
    );
});

add_action('admin_init', function () {
    register_setting('leons_random_generators', LRG_OPTION, [
        'type' => 'array',
        'sanitize_callback' => function ($value) {
            $key = '';
            if (is_array($value) && isset($value['flickr_api_key'])) {
                $key = sanitize_text_field($value['flickr_api_key']);
            }
            return ['flickr_api_key' => $key];
        },
        'default' => ['flickr_api_key' => ''],
    ]);
});

function lrg_render_settings() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $key = lrg_flickr_key();
    ?>
    <div class="wrap">
        <h1>Leon's Random Generators</h1>
        <form method="post" action="options.php">
            <?php settings_fields('leons_random_generators'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="lrg-flickr-key">Flickr API key</label></th>
                    <td>
                        <input name="<?php echo esc_attr(LRG_OPTION); ?>[flickr_api_key]" id="lrg-flickr-key" type="password" class="regular-text" value="<?php echo esc_attr($key); ?>" autocomplete="off">
                        <p class="description">Used only by the server to fetch album-cover photos. Leave blank to use a random solid color.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
