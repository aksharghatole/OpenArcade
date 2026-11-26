/* SPDX-License-Identifier: MIT */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const root='http://127.0.0.1:8000/';
 await page.goto(root);
 await page.getByRole('heading',{name:'Obsidian',exact:true}).waitFor();
 await page.locator('article').filter({has:page.getByRole('heading',{name:'Obsidian',exact:true})}).getByRole('link',{name:'Play now'}).click();
 await page.waitForURL('**/games/obsidian/');
 await page.locator('#mode').selectOption('local');
 await page.locator('#new').click();
 const cell=i=>page.locator('.cell').nth(i);
 assert.equal(await page.locator('.cell.legal').count(),4);
 await cell(19).tap();
 assert.equal(await page.locator('#dark').textContent(),'4');
 assert.equal(await page.locator('#light').textContent(),'1');
 await page.reload();
 assert.equal(await page.locator('#dark').textContent(),'4');
 await page.locator('#undo').click();
 assert.equal(await page.locator('#dark').textContent(),'2');
 await cell(19).focus();
 await page.keyboard.press('Enter');
 assert.equal(await page.locator('#dark').textContent(),'4');
 await page.locator('#undo').click();
 await page.locator('#hint').click();
 assert.match(await page.locator('#status').textContent(),/Suggested move/);
 await page.locator('#mode').selectOption('ai');
 await page.locator('#difficulty').selectOption('1');
 await page.locator('#new').click();
 await cell(19).tap();
 await page.waitForFunction(()=>document.querySelectorAll('.cell .piece').length===6);
 assert.match(await page.locator('#status').textContent(),/Obsidian to move/);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);
 await page.reload();
 assert.equal(await page.locator('.cell .piece').count(),6);
 await page.locator('header a').first().click();
 await page.getByRole('heading',{name:'Obsidian',exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('Obsidian browser checks passed');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
