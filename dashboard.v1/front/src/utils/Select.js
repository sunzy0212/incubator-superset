export function filterOptions(options, values, search) {
    return _.chain(options)
        .filter((option) => option.label.indexOf(search) > -1)
        .map((option) => {
            option.selectable = values.map((item) =>item.value).indexOf(option.value) == -1
            return option;
        })
        .value()

}