'use strict';
const testMod = module.exports;

testMod.arrow = () => {
  const a = 'test';
  return a;
};

testMod.named = function named() {};

testMod.anon = function() {};
