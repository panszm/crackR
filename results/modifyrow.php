<?php

$index = $_GET['index'];
$val = $_GET['val'];
$lines = file("data.csv");

if($index>=count($lines)){
    for($i=1+$index-count($lines);$i>0;$i=$i-1){
        array_push($lines,"\n");
    }
}

$lines[$index] = $val."\n";

file_put_contents("data.csv", $lines);

exit;
?>