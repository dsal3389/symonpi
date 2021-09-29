#! /bin/sh


readonly CWD=$(dirname $(readlink -f $0));
readonly MODULE_FOLDER="${CWD}/modules";
readonly CURL=$(which curl); # checks if program exists


fatal () {
    printf "${1}\n" 1>&2; # printf to stderr
    exit;
}

runModuleTest () {
    printf "\n${1}\n====STARTS====\n";

    /bin/sh $1 $2;
    [ ! $? -eq 0 ] && fatal "FAILED ${1}";
    # exit is test return status code not eq to 0

    printf "=====ENDS=====\n\n";
}


[ -z $CURL ] && fatal "please install curl for testing\n";
[ -z $1 ] && fatal "usage::${0} <hostname:port> <module (optional)>";


for modTest in $(ls $MODULE_FOLDER)
do
    readonly ABS="${MODULE_FOLDER}/${modTest}";
    [ -x $ABS ] && runModuleTest $ABS $1; 
done
