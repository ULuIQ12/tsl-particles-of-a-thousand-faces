<?php
    $dir = "./";
    $files = scandir($dir);
    $files = array_values(array_diff($files, array('..', '.')));
    $presets = [];
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === "json") {
            $presets[] = pathinfo($file, PATHINFO_FILENAME);
        }
    }
    echo json_encode($presets);
?>