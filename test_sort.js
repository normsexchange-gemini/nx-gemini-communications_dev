let arr = [
  {id: 1, hasPublicApi: true},
  {id: 2, hasPublicApi: false},
  {id: 3, hasPublicApi: true},
  {id: 4, hasPublicApi: true},
  {id: 5, hasPublicApi: false}
];
arr.sort((a,b) => {
  return (b.hasPublicApi ? 1 : 0) - (a.hasPublicApi ? 1 : 0);
});
console.log(arr);
