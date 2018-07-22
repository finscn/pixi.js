/**
 * Sort array with insert Sort algorithm by the property of array items.
 * only ascending order
 * @param {array} array - the array to sort.
 * @param {string} propertyName - the property name of array items.
 */
export default function insertSort(array, propertyName)
{
    let t1;
    let t2;
    const count = array.length;

    for (let i = 1; i < count; i++)
    {
        t1 = array[i];
        const sortValue = t1[propertyName];

        let j = i;

        for (; j > 0 && (t2 = array[j - 1])[propertyName] > sortValue; j--)
        {
            array[j] = t2;
        }
        array[j] = t1;
    }
}
