# Dom interpreter

A jQuery based set of snippets to create basic interaction components using the DOM.

## Base idea

Serve a simple set of Dom configurable elements in a compact Jquery addon.

#### Toggle Buttons

> You need to open a menu? A Dropdown? A Search menu interface? Just toggle

```html
<div class="js-toggle" data-target="#menu" data-toggle-class="opened">
```

#### Tabs

> Useful to show one element at a time, within a group of elements

```html
<div class="js-tab" data-group-id="tab_group_1" data-target="body" data-target-class="opened">
```

#### Scroll Triggers

>Activated when the element is scrolled out of the window.

```html
<div class="js-scroll-trigger" data-target="body" data-toggle-class="with-fixed-header">
```

#### Overflow Boxes

>Only have limited space to show elements ? Move the rest automatically to another place.
Some elements are more important than others ? no worries! It supports priorities.

```html
<div class="js-overflow-box" data-target="#storage">
  <div data-priority="5">this one will be removed first</div>
  <div>some element with no priority. The default is 0</div>
</div>

<div id="storage">Here is where the elements will be stored.</div>
```
