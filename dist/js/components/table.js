((bbn) => {
let script = document.createElement('script');
script.innerHTML = `<div :class="[{'bbn-overlay': scrollable, 'bbn-block': !scrollable}, componentClass]">
  <div :class="{'bbn-overlay': scrollable, 'bbn-flex-height': scrollable, 'bbn-block': !scrollable}"
       :style="scrollable && groupCols.length ? {} : {
         width: totalWidth
       }"
       v-if="cols.length"
  >
    <div v-if="hasToolbar"
         class="bbn-table-toolbar bbn-bordered-bottom"
         ref="toolbar"
    >
      <div v-if="toolbarButtons.length"
           class="bbn-flex-width bbn-header bbn-spadded bbn-unselectable">
        <slot name="toolbar"></slot>
        <div class="bbn-flex-fill">
          <bbn-button v-for="(button, i) in toolbarButtons"
                      class="bbn-hsmargin"
                      :key="i"
                      v-bind="button"
                      @click.prevent.stop="_execCommand(button, i)"
          ></bbn-button>
        </div>
      </div>
      <div v-else-if="typeof toolbar === 'function'"
           v-html="toolbar()"
      ></div>
      <component v-else
                 :is="toolbar"
      ></component>
    </div>


    <div :class="{
      'bbn-table-titles': true,
      'bbn-table-titles-group': !!titleGroups,
      'bbn-unselectable': true
    }"  v-if="titles">
      <div :class="{'bbn-overlay': scrollable, 'bbn-flex-width': true}">
        <!-- Looping the groups -->
        <div  v-for="(groupCol, groupIndex) in groupCols"
              v-if="groupCol.cols.length"
              :class="{
                'bbn-table-part': true,
                'bbn-flex-fill': groupCol.name === 'main'
              }"
              :style="{
                width: groupIndex === 1 ? 'auto' : groupCol.width + 'px',
                overflow: groupCol.name === 'main' ? 'hidden' : 'visible'
              }"
              :ref="groupCol.name + 'Titles'"
        >
          <table class="bbn-widget bbn-no-border bbn-table-t" :style="{width: groupCol.width + 'px'}">
            <colgroup>
              <col v-for="(col, i) in groupCol.cols"
                  v-show="!col.hidden"
                  :style="{width: col.realWidth + 'px'}"
                  :key="i"
              >
            </colgroup>
            <thead>
            <tr v-if="titleGroups"
            >
              <td v-for="col in titleGroupsCells(groupIndex)"
                  :colspan="col.colspan">
                <component v-if="col.component"
                          :is="col.component"
                          :source="col"
                ></component>
                <div class="bbn-100 bbn-table-title-group" v-else>
                  <div :class="col.cls"
                      :style="col.style"
                      v-html="col.text"
                  ></div>
                </div>
              </td>
            </tr>
            <!-- Titles -->
            <tr>
              <td v-for="(col, i) in groupCol.cols"
                  v-show="!col.hidden"
                  :style="{width: col.realWidth + 'px'}"
                  class="bbn-c"
              >
                <i :class="{
                    nf: true,
                    'nf-fa-filter': true,
                    'bbn-p': true,
                    'bbn-red': hasFilter(col)
                  }"
                  v-if="filterable && (col.filterable !== false) && !col.buttons && col.field"
                  @click="filterElement = $event.target; currentFilter = col;showFilter(col, $event)"
                ></i>
                <div v-if="col.isExpander" :title="_('Expand all')">
                  <!-- @todo an icon for expanding all/none -->
                </div>
                <div v-else-if="col.isSelection" :title="_('Check all')">
                  <!-- @todo an icon for selecting all/none -->
                </div>
                <component v-else-if="col.tcomponent"
                          :is="col.tcomponent"
                          :source="col"
                ></component>
                <span class="bbn-p"
                      v-else-if="sortable && (col.sortable !== false) && !col.buttons"
                      @click="sort(col)">
                  <span v-if="col.encoded"
                        v-text="col.title || col.field || ' '"
                        :title="col.ftitle || col.title || col.field"
                  ></span>
                  <span v-else
                        v-html="col.title || col.field || ' '"
                        :title="col.ftitle || col.title || col.field || ' '"
                  ></span>
                </span>
                <span v-else>
                  <span v-if="col.encoded"
                        v-text="col.title || col.field || ' '"
                        :title="col.ftitle || col.title || col.field || ' '"
                  ></span>
                  <span v-else
                        v-html="col.title || col.field || ' '"
                        :title="col.ftitle || col.title || col.field || ' '"
                  ></span>
                </span>
                <i v-if="isSorted(col)"
                  :class="{
                'bbn-table-sortable-icon': true,
                nf: true,
                'nf-fa-caret_up': isSorted(col).dir === 'ASC',
                'nf-fa-caret_down': isSorted(col).dir === 'DESC',
              }"></i>
              </td>
            </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>

    <div :class="{'bbn-flex-fill': scrollable, 'bbn-table-main': true, 'bbn-w-100': true}">
      <div :class="{'bbn-overlay': scrollable, 'bbn-block': !scrollable}">
        <div class="bbn-table-container"
              ref="container"
              @scroll.passive="_scrollContainer"
              :style="{
                width: containerWidth,
                overflowX: groupCols[0].width + groupCols[1].width + groupCols[2].width > lastKnownCtWidth ? 'scroll' : 'hidden',
                marginLeft: groupCols[0].width + 'px',
                marginRight: groupCols[2].width + 'px',
                maxWidth: scrollable ? '100%' : null,
                maxHeight: scrollable ? '100%' : null
              }">
          <div v-if="isLoading && initReady" class="bbn-overlay bbn-middle">
            <h1 v-text="_('Loading') + '...'"></h1>
          </div>
          <div v-else-if="!filteredData.length && !tmpRow"
               :class="{
                 'bbn-overlay': scrollable,
                 'bbn-w-100': !scrollable,
                 'bbn-middle': scrollable,
                 'bbn-c': !scrollable,
                 'bbn-padded': true,
                 'bbn-bordered': true,
                 'bbn-no-border-top': true,
                 'bbn-background': true
                }" 
                v-html="noData || ' '">
          </div>
          <table v-else-if="currentColumns.length"
                 ref="table"
                :style="{width: groupCols[1].width + 'px'}">
            <colgroup v-if="!groupCols[0].width && !groupCols[2].width">
              <col v-for="col in currentColumns" :style="{width: col.realWidth}">
            </colgroup>
            <tbody>
              <tr v-for="(d, i) in items"
                  :key="i"
                  :index="d.index"
                  :tabindex="0"
                  @focusout="focusout(i, $event)"
                  @focusin="focusin(i, $event)"
                  @dblclick="if ( focusedRow !== i ) { focusedRow = i }"
                  :class="[{
                    'bbn-alt': !!(i % 2),
                    'bbn-header': !!(d.aggregated || d.groupAggregated),
                  }, trClass ? trClass(d.data) : '']"
              >
                <!-- Group lines just have the cell with the expander and a single big cell -->
                <template v-if="groupable && d.group">
                  <td :class="currentColumns[0].fixed ? cssRuleName + ' bbn-table-fixed-cell bbn-table-cell-left' : ''"
                      :style="{
                        left: currentColumns[0].left !== undefined ? currentColumns[0].left + 'px' : 'auto',
                        width: currentColumns[0].realWidth
                      }">
                    <div @click="toggleExpanded(d.index)"
                         class="bbn-table-expander bbn-p bbn-unselectable bbn-spadded"
                         v-if="d.expander"
                         @keydown.space="toggleExpanded(d.index)"
                         tabindex="0"
                         >
                      <i :class="'nf nf-fa-caret_' + (isExpanded(d) ? 'down' : 'right') + ' bbn-lg'"
                      ></i>
                    </div>
                  </td>
                  <td :class="currentClass(cols[group], d.data, i)"
                      :colspan="currentColumns.length - 1">
                    <!--span v-if="!isGroupedCell(groupIndex, d)"></span-->
                    <component v-if="cols[group].component"
                              :is="cols[group].component"
                              class="bbn-spadded"
                              :source="d.data"
                    ></component>
                    <div v-else v-html="render(d.data, cols[group], d.index) + (d.expanded ? '' : ' (' + d.num + ')')"></div>
                  </td>
                </template>
                <!--td v-else-if="d.expansion && !selection"
                    :class="col.fixed ? cssRuleName : ''"
                    :colspan="currentColumns.length">
                  &nbsp;
                </td-->
                <td v-else-if="d.expansion"
                    :class="currentColumns[0].fixed ? cssRuleName + ' bbn-table-fixed-cell bbn-table-cell-left' : ''"
                    :colspan="currentColumns.length">
                  <component v-if="typeof(expander) !== 'function'"
                            :is="expander"
                            class="bbn-spadded"
                            :source="d.data"
                  ></component>
                  <div v-else v-html="expander(d.data, i)"></div>
                </td>
                <td v-else
                    v-for="(col, index) in currentColumns"
                    @click="clickCell"
                    :class="[
                      currentClass(col, d.data, i),
                      col.fixed ? cssRuleName + ' bbn-table-fixed-cell bbn-table-cell-' +
                        (col.isRight ? 'right' : 'left')
                        : ''
                    ]"
                    :style="{
                      left: col.left !== undefined ? col.left + 'px' : 'auto',
                      width: col.realWidth
                    }">
                  <!-- Checkboxes -->
                  <div class="bbn-block bbn-spadded">
                    <div v-if="col.isSelection" class="bbn-c bbn-w-100">
                      <bbn-checkbox v-if="d.selection"
                                    :checked="d.selected"
                                    :value="true"
                                    :novalue="false"
                                    :strict="true"
                                    @change="checkSelection(i)"
                      ></bbn-checkbox>
                    </div>
                    <template v-else-if="d.aggregated || d.groupAggregated">
                      <span v-if="col.isAggregatedTitle"
                            :class="d.aggregated ? 'bbn-b' : ''"
                            v-text="aggregateExp[d.name]"
                      ></span>
                      <div v-else-if="col.aggregate"
                          v-html="render(d.data, col, i)"></div>
                      <span v-else></span>
                      <!-- The row is an aggregate and there are no other cells -->
                    </template>
                        <!-- Expander -->
                    <div v-else-if="col.isExpander"
                        @click="toggleExpanded(d.index)"
                        class="bbn-table-expander bbn-lg bbn-p bbn-unselectable">
                      <i :class="'nf nf-fa-caret_' + (isExpanded(d) ? 'down' : 'right') + ' bbn-unselectable'"
                        v-if="d.expander"
                        tabindex="0"
                      ></i>
                    </div>
                    <template v-else>
                      <span class="bbn-table-dirty bbn-top-left"
                            v-if="isDirty(d, col, i)"></span>
                      <div v-if="isEdited(d.data, col, i)">
                        <div v-if="(editMode === 'inline') && (editable !== 'nobuttons') && (col.index === colButtons)">
                          <bbn-button :text="_('Save')"
                                      :disabled="!isEditedValid"
                                      icon="nf nf-fa-save"
                                      :notext="true"
                                      @focusin.stop=""
                                      @click.prevent.stop="saveInline"
                                      style="margin: 0 .1em"
                          ></bbn-button>
                          <bbn-button :text="_('Cancel')"
                                      icon="nf nf-fa-times"
                                      :notext="true"
                                      @focusin.stop=""
                                      @click.prevent.stop="cancel"
                                      style="margin: 0 .1em"
                          ></bbn-button>
                        </div>
                        <component v-else-if="(editMode === 'inline') && col.field && (col.editable !== false)"
                                  v-bind="getEditableOptions(col, d.data)"
                                  :is="getEditableComponent(col, d.data)"
                                  @click.stop=""
                                  v-model="editedRow[col.field]"
                                  style="width: 100%"
                        ></component>
                        <bbn-field v-else-if="col.field && !col.render && !!col.buttons"
                                  v-bind="col"
                                  @click.stop=""
                                  :key="d.index"
                                  :value="d.data[col.field]"
                                  :data="d.data">
                        </bbn-field>
                        <div v-else-if="!col.buttons && col.render"
                            v-html="col.render(d.data, col, i)"></div>
                        <div v-else-if="!col.buttons" v-html="render(d.data, col, i)"></div>
                        <div v-else> </div>
                      </div>
                      <component v-else-if="col.component"
                                :is="col.component"
                                v-bind="col.options"
                                :source="col.mapper ? col.mapper(d.data) : d.data"
                      ></component>
                      <div v-else-if="col.buttons" class="bbn-c">
                        <bbn-button v-for="(button, bi) in (Array.isArray(col.buttons) ? col.buttons : col.buttons(d.data, col, i))"
                                    :key="bi"
                                    v-bind="button"
                                    @focusin.prevent.stop="() => {}"
                                    @focusout.prevent.stop="() => {}"
                                    @click.prevent.stop="_execCommand(button, d.data, col, i, $event)"
                                    style="margin: 0 .1em"
                        ></bbn-button>
                      </div>
                      <div v-else v-html="render(d.data, col, i)"></div>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div :style="{
          position: 'absolute',
          left: groupCols[0].width + 'px',
          right: groupCols[2].width + 'px',
          bottom: '0px'
        }">
          <bbn-scrollbar v-if="!isLoading && scrollable && ready"
                         orientation="horizontal"
                         ref="xScroller"
                         :scrollAlso="_getScrollers"
                         @hook:mounted="hasScrollX = true"
                         @hook:beforeDestroy="hasScrollX = false"
                         :container="getRef('container')">
          </bbn-scrollbar>
        </div>
        <bbn-scrollbar v-if="!isLoading && scrollable && ready"
                      orientation="vertical"
                      ref="yScroller"
                      @hook:mounted="hasScrollY = true"
                      @hook:beforeDestroy="hasScrollY = false"
                      :container="getRef('container')">
        </bbn-scrollbar>

      </div>
    </div>

    <!-- Footer -->
    <div class="bbn-table-footer bbn-widget bbn-unselectable"
         v-if="pageable || saveable || filterable || isAjax || showable"
    >
      <div class="bbn-block"
           v-if="pageable && currentData.length"
      >
        <bbn-button icon="nf nf-fa-angle_double_left"
                    :notext="true"
                    :title="_('Go to the first page')"
                    :disabled="currentPage == 1"
                    @click="currentPage = 1"
        ></bbn-button>
        <bbn-button icon="nf nf-fa-angle_left"
                    :notext="true"
                    :title="_('Go to the previous page')"
                    :disabled="currentPage == 1"
                    @click="currentPage--"
        ></bbn-button>
        <span v-text="_('Page')"></span>
        <span v-if="isLoading"
              v-text="currentPage"
              class="bbn-iblock bbn-c bbn-narrower bbn-right-sspace"
        ></span>
        <bbn-numeric v-else
                     v-model="currentPage"
                     :min="1"
                     :max="numPages"
                     class="bbn-narrower bbn-right-sspace"
        ></bbn-numeric>
        <span v-text="_('of') + ' ' + numPages" style="margin-right: 0.25em"></span>
        <bbn-button icon="nf nf-fa-angle_right"
                    :notext="true"
                    :title="_('Go to the next page')"
                    :disabled="currentPage == numPages"
                    @click="currentPage++"
        ></bbn-button>
        <bbn-button icon="nf nf-fa-angle_double_right"
                    :notext="true"
                    :title="_('Go to the last page')"
                    @click="currentPage = numPages"
                    :disabled="currentPage == numPages"
        ></bbn-button>
        <span class="bbn-hmargin">
          <bbn-dropdown :source="limits"
                        v-model.number="currentLimit"
                        @change="currentPage = 1"
                        :disabled="!!isLoading"
                        :autosize="true"
          ></bbn-dropdown>
          <span v-text="_('rows per page')"></span>
        </span>
      </div>
      <div class="bbn-block" style="float: right">
        <span v-if="filteredData.length && pageable && isAjax"
              v-text="(start+1) + '-' + (start + currentLimit > total ? total : start + currentLimit) + ' ' + _('of') + ' ' + total"
        ></span>
        <span v-else-if="filteredData.length && pageable && !isAjax"
              v-text="(start+1) + '-' + (start + currentLimit > filteredData.length ? filteredData.length : start + currentLimit) + ' ' + _('of') + ' ' + filteredData.length"
        ></span>
        <span v-else
              v-text="total ? _('Total') + ': ' + total + ' ' + _('items') : _('No item')"
        ></span>
        &nbsp;
        <bbn-button v-if="currentQuery"
                    :title="_('View SQL query')"
                    @click="showQuery"
                    icon="nf nf-mdi-database">
        </bbn-button>
        <bbn-button v-if="saveable"
                    :disabled="isSaved"
                    :title="_('Save current configuration')"
                    @click="$emit('save', currentConfig)"
                    icon="nf nf-fa-save"
        ></bbn-button>
        <bbn-button v-if="filterable || showable"
                    :disabled="!isChanged"
                    :title="_('Reset to original configuration')"
                    @click="reset(false)"
                    icon="nf nf-fa-undo"
        ></bbn-button>
        <bbn-button v-if="showable"
                    :title="_('Columns\' picker')"
                    @click="openColumnsPicker"
                    icon="nf nf-fa-columns"
        ></bbn-button>
        <bbn-button v-if="filterable && multifilter"
                    :title="_('Multi Filter')"
                    :class="{'bbn-red': currentFilters && currentFilters.conditions.length ? true : false}"
                    @click="openMultiFilter"
                    icon="nf nf-mdi-filter_variant"
        ></bbn-button>
        <bbn-button v-if="isAjax"
                    :title="_('Refresh')"
                    @click="updateData"
                    icon="nf nf-fa-refresh"
        ></bbn-button>
      </div>

    </div>
  </div>
  <bbn-floater v-if="currentFilter"
               class="bbn-table-floating-filter bbn-widget"
               :element="filterElement"
               @close="currentFilter = false"
               :auto-hide="true"
               :width="600"
               :height="200"
               :scrollable="false"
               :left="floatingFilterX"
               :top="floatingFilterY">
    <bbn-filter v-bind="getFilterOptions()"
                @set="onSetFilter"
                @unset="unsetCurrentFilter"
    ></bbn-filter>
    <div v-if="multifilter"
         class="bbn-table-filter-link bbn-p bbn-b bbn-i"
         @click="openMultiFilter">
      <i class="zmdi zmdi-filter-list"></i>
      <span v-text="_('Open the full filter')"></span>
    </div>
  </bbn-floater>
  <bbn-popup ref="popup" v-if="inTable === false"></bbn-popup>
</div>
`;
script.setAttribute('id', 'bbn-tpl-component-table');
script.setAttribute('type', 'text/x-template');
document.body.insertAdjacentElement('beforeend', script);
let css = document.createElement('style');
css.innerHTML = `.bbn-table > div div.bbn-table-titles {
  position: relative;
  height: 40px;
  width: 100%;
}
.bbn-table > div div.bbn-table-titles table {
  border-collapse: collapse;
  table-layout: fixed;
}
.bbn-table > div div.bbn-table-titles.bbn-table-titles-group {
  height: 79px;
}
.bbn-table > div div.bbn-table-titles tr {
  height: 39px;
}
.bbn-table > div div.bbn-table-titles tr td {
  box-sizing: border-box;
  position: relative;
  padding: 0.5em;
  white-space: nowrap;
  overflow: hidden;
  font-weight: bold;
  vertical-align: middle;
}
.bbn-table > div div.bbn-table-titles tr td > span.bbn-p {
  text-overflow: ellipsis;
}
.bbn-table > div div.bbn-table-titles tr td .bbn-table-title-group {
  position: absolute;
  left: 0px;
  top: 0px;
  margin-left: 20px;
}
.bbn-table > div div.bbn-table-titles tr td .bbn-table-title-group > div {
  height: 100%;
  vertical-align: middle;
  line-height: 38px;
}
.bbn-table > div div.bbn-table-titles tr td i.fa.fa-filter {
  position: absolute;
  top: 1px;
  left: 0px;
}
.bbn-table > div > .bbn-table-toolbar {
  min-height: 3.2em;
}
.bbn-table > div > div.bbn-table-main {
  overflow: hidden;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container {
  overflow-y: auto;
  scrollbar-width: none;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container::-webkit-scrollbar {
  display: none;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table {
  outline: 0;
  width: auto;
  table-layout: fixed;
  border-collapse: collapse;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > thead tr {
  height: 39px;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > thead tr th {
  position: relative;
  padding: 0.5em;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: bold;
  vertical-align: middle;
  line-height: 2.5em;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > thead tr th i.bbn-table-sortable-icon {
  position: absolute;
  left: 50%;
  bottom: 0px;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr.bbn-widget {
  box-sizing: border-box;
  border-left-width: 0;
  border-right-width: 0;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td {
  overflow: hidden;
  box-sizing: border-box;
  border-top: 0px;
  padding: 0;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td.bbn-table-fixed-cell {
  position: absolute;
  top: auto;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td > div {
  overflow: hidden;
  height: 100%;
  width: 100%;
  word-break: break-word;
  box-sizing: border-box;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td > div > .bbn-table-expander {
  line-height: 1em;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td > div > .bbn-table-expander i:focus {
  color: red;
  outline: 0;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td > div .bbn-table-dirty {
  width: 0px;
  height: 0px;
  border-style: solid;
  border-width: 3px;
  border-color: red transparent transparent red;
  padding: 0;
}
.bbn-table > div > div.bbn-table-main > div > div.bbn-table-container > table > tbody > tr td > div .bbn-table-dirty:before {
  content: "\a0";
  display: inline-block;
  width: 0;
  float: left;
}
.bbn-table > div > div.bbn-table-footer {
  clear: both;
  overflow: hidden;
  position: relative;
  border-style: solid;
  border-width: 0.0833em;
  line-height: 2em;
  padding: .333em .25em;
}
.bbn-table > div .toolbar-buttons {
  padding: 0.3em 0;
}
.bbn-table > div .toolbar-buttons button {
  margin: 0 0.3em;
}
.bbn-table .bbn-table-floating-filter .bbn-table-filter-link {
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;
}
.bbn-table.bbn-overlay > div > div.bbn-table-main > div > div.bbn-table-container {
  min-height: 100%;
}
.bbn-table-column-picker ul {
  list-style: none;
}
`;
document.head.insertAdjacentElement('beforeend', css);
/**
 * @file bbn-table component
 *
 * @description  bbn-table is a powerful component of wide configuration that offers vast customizations.
 * The source obtains it by giving a url to retrieve data or directly supplying an array.
 * It allows you to easily modify the content by entering new data in the input field corresponding to the type of column being defined.
 * The table rows can be sorted by clicking on a column header.
 * Table elements can be filtered with the help of a built-in filters in the column headings or using a multifilter panel and a reset by removing a filter or all filters with just one click.
 * It's possible to create fixed areas that will keep their position by always having them available during scrolling.
 * It gives the possibility to group the data.
 * These are some examples of what can be done with this component, from the few configuration lines we can express considerable work complexity.
 *
 * @author BBN Solutions
 *
 * @copyright BBN Solutions
 */

(function (bbn, Vue) {
  "use strict";
  Vue.component('bbn-table', {
    /**
     * @mixin bbn.vue.basicComponent
     * @mixin bbn.vue.resizerComponent
     * @mixin bbn.vue.listComponent
     * @mixin bbn.vue.dataEditorComponent
     * @mixin bbn.vue.localStorageComponent
     * @mixin bbn.vue.observerComponent
     * @mixin bbn.vue.keepCoolComponent
     * @mixin bbn.vue.dataComponent
     */
    mixins: [
      bbn.vue.basicComponent,
      bbn.vue.resizerComponent,
      bbn.vue.listComponent,
      bbn.vue.dataEditorComponent,
      bbn.vue.localStorageComponent,
      bbn.vue.observerComponent,
      bbn.vue.keepCoolComponent,
      bbn.vue.dataComponent
    ],
    props: {
      /**
       * True if the columns has to have titles.
       * @prop {Boolean} [true] titles
       */
      titles: {
        type: Boolean,
        default: true
      },
      /**
       * The message to show when the table has no data.
       * @prop {String} ['<h3>' + bbn._('No Data') + '</h3>'] noData
       */
      noData: {
        default: '<h3>' + bbn._('No Data') + '</h3>'
      },
      /**
       * If the property 'group' is given to one or more columns in the table (ex: group="test"), it defines the title of a group of columns. (ex: titleGroups="[{value: 'test', text: 'My group'}]").
       * @prop {Array|Function} titleGroups
       */
      titleGroups: {
        type: [Array, Function]
      },
      /**
       * The object popup of the table.
       * @prop {Object} Vue
       */
      popup: {
        type: Vue
      },
      /**
       * Defines the behaviour of the table about the scroll.
       * @prop {Boolean} [true] scrollable
       */
      scrollable: {
        type: Boolean,
        default: true
      },
      /**
       * Set to true allows the table to be resizable.
       * @prop {Boolean} [false] resizable
       */
      resizable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true will automatically update the data before mount.
       * @prop {Boolean} [false] autobind
       */
      autobind: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows a button at the bottom right of the table that opens a column picker for the table.
       * @prop {Boolean} [false] showable
       */
      showable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true shows a save icon that allows to save the current configuration of the table at the bottom right of the table.
       * @prop {Boolean} [false] saveable
       */
      saveable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true allows the table to be groupable according to the props groupBy.
       * @prop {Boolean} [false] groupable
       */
      groupable: {
        type: Boolean,
        default: false
      },
      /**
       * Set to true allows to edit inline table's fields if no buttons are defined for the table. Allowed values 'inline','nobuttons'.
       * @prop {Boolean|String|Function} editable
       */
      editable: {
        type: [Boolean, String, Function]
      },
      /**
       * In case of Ajax table, set to true will make an Ajax call to group the table by a field.
       * @prop {Boolean} [true] serverGrouping
       */
      serverGrouping: {
        type: Boolean,
        default: true
      },
      /**
       * Set to false will make an Ajax call for the grouping.
       * @prop {Boolean} [true] localGrouping
       */
      localGrouping: {
        type: Boolean,
        default: true
      },
      /**
       * Defines the minimum columns width.
       * @prop {Number} [30] minimumColumnWidth
       */
      minimumColumnWidth: {
        type: Number,
        default: 30
      },
      /**
       * Defines the default columns width.
       * @prop {Number} [150] defaultColumnWidth
       */
      defaultColumnWidth: {
        type: Number,
        default: 150
      },
      /**
       * @todo not used in the component
       */
      paginationType: {
        type: String,
        default: 'input'
      },
      /**
       * @todo not used in the component
       */
      info: {
        type: Boolean,
        default: false
      },
      /**
       * @todo not used in the component
       */
      search: {
        type: Boolean,
        default: false
      },
      /**
       * If defined, the form created for the edit of the table will have this URL as action.
       * @prop {String} url
       */
      url: {
        type: String
      },
      /**
       * A function to define css class(es) for the rows.
       * @prop {Function} trClass
       * @todo doesn't work if a string is given
       */
      trClass: {
        type: [String, Function]
      },
      /**
       * Defines the message to show in the confirm when an action is made on the row.
       * @prop {String|Function|Boolean} confirmMessage
       */
      confirmMessage: {
        type: [String, Function, Boolean],
        default: bbn._('Are you sure you want to delete this row?')
      },
      /**
       * Defines the expander of the rows.
       * @prop  {Object|String|Function} expander
       * 
       */
      expander: {

      },
      /**
       * not used in the component
       */
      loader: {
        type: Boolean,
        default: false
      },
      /**
       * Defines the editor to use when the edit button of a row is clicked.
       * @prop {String|Object} editor
       */
      editor: {
        type: [String, Object]
      },
      /**
       * If one or more columns have the property fixed set to true it defines the side of the fixed column(s).
       * @prop {String} ['left'] fixedDefaultSide
       */
      fixedDefaultSide: {
        type: String,
        default: "left"
      },
      /**
       * Defines the toolbar of the table.
       * @prop {Object|String|Function} toolbar
       */
      toolbar: {

      },
      /**
       * An array of objects with at least the property 'field' that can replace the html '<bbns-column></bbns-column>' or extend them.
       * @prop {Array} [[]] columns
       */
      columns: {
        type: Array,
        default: function () {
          return [];
        }
      },
      /**
       * The index of the property to group by the table referred to the object of data of the row.
       * @prop {Number} groupBy
       */
      groupBy: {
        type: Number
      },
      /**
       * @todo desc
       * @prop {Array|Function} expandedValues
       *
       */
      expandedValues: {
        type: [Array, Function]
      },
      /**
       * In a grouped table, if set to true defines that all rows will be expanded. If an array is given defines which row(s) of the table will be expanded.
       * @prop {Boolean|Array} [[]] expanded
       */
      expanded: {
        type: [Boolean, Array],
        default () {
          return [];
        }
      },
      /**
       * Defines the footer of the table.
       * @prop {String|Object} footer
       */
      footer: {
        type: [String, Object]
      },
      /**
       * Defines the footer for a group of columns.
       * @prop {String|Object} groupFooter
       */
      groupFooter: {
        type: [String, Object]
      },
      /**
       * @todo desc
       * @prop {Object} [{tot: 'Total',med: 'Average',num: 'Count',max: 'Maximum',min: 'Minimum'}] aggregateExp
       */
      aggregateExp: {
        type: Object,
        default () {
          return {
            tot: bbn._('Total'),
            med: bbn._('Average'),
            num: bbn._('Count'),
            max: bbn._('Maximum'),
            min: bbn._('Minimum'),
          };
        }
      },
      /**
       * @prop {String|Array} aggregate
       */
      aggregate: {
        type: [String, Array]
      },
      /**
       * @todo desc
       * @prop {Object} loadedConfig
       */
      loadedConfig: {
        type: Object
      }
    },
    data() {
      let editable = bbn.fn.isFunction(this.editable) ? this.editable() : this.editable;
      return {
        /**
         * @data {Boolean} [false] _observerReceived
         */
        _observerReceived: false,
        /**
         * The group of columns.
         * @data {Object} [[{name: 'left',width: 0,visible: 0,cols: []},{name: 'main',width: 0,visible: 0,cols: []},{name: 'right',width: 0,visible: 0,cols: []}]] groupCols
         */
        groupCols: [{
            name: 'left',
            width: 0,
            visible: 0,
            cols: []
          },
          {
            name: 'main',
            width: 0,
            visible: 0,
            cols: []
          },
          {
            name: 'right',
            width: 0,
            visible: 0,
            cols: []
          }
        ],
        /**
         * @data {Boolean} [false] initReady
         */
        initReady: false,
        /**
         * The current configuration object.
         * @data {Object} [{}] currentConfig
         */
        currentConfig: {},
        /**
         * The saved configuration.
         * @data {Boolean} [false] savedConfig
         */
        savedConfig: false,
        /**
         * The default confuguration
         * @data {Object} defaultConfig
         */
        defaultConfig: bbn.fn.extend({
          filters: this.filters,
          limit: this.limit,
          order: this.order,
          hidden: this.hidden || null,
        }, this.loadedConfig || {}),
        /**
         * @data {Boolean} [false] editedFilter
         */
        editedFilter: false,
        /**
         * @data {Number} [0] floatingFilterX
         */
        floatingFilterX: 0,
        /**
         * @data {Number} [0] floatingFilterY
         */
        floatingFilterY: 0,
        /**
         * @data {Number} [0] floatingFilterTimeOut
         */
        floatingFilterTimeOut: 0,
        /**
         * @data {Array} currentHidden
         */
        currentHidden: this.hidden || [],
        /**
         * @data {Boolean|Number} [false] group
         */
        group: this.groupBy === undefined ? false : this.groupBy,
        /**
         * @data {String} editMode
         */
        editMode: editable === true ? (this.editor ? 'popup' : 'inline') : (editable === 'popup' ? 'popup' : 'inline'),
        /**
         * @data {Boolean|Object} [false] tmpRow
         */
        tmpRow: false,
        /**
         * @data {Boolean|Object} [false] originalRow
         */
        originalRow: false,
        /**
         * @data {Boolean|Object} [false] editedRow
         */
        editedRow: false,
        /**
         * @data {Boolean|Number} [false] editedIndex
         */
        editedIndex: false,
        /**
         * @data {Array} [[]] cols
         */
        cols: [],
        /**
         * @data {Boolean} [false] table
         */
        table: false,
        /**
         * @data {Boolean} [false] colButtons
         */
        colButtons: false,
        /**
         * @data {} [null] scrollableContainer
         */
        scrollableContainer: null,
        /**
         * @data {Boolean} [true] hiddenScroll
         */
        hiddenScroll: true,
        /**
         * @data {Array} [[]] popups
         */
        popups: [],
        /**
         * @data {Boolean} [false] isAggregated
         */
        isAggregated: false,
        /**
         * @data {Array} [[]] aggregatedColumns
         */
        aggregatedColumns: [],
        /**
         * @data {Boolean} [false] updaterTimeout
         */
        updaterTimeout: false,
        /**
         * @data {Boolean} allExpanded
         */
        allExpanded: this.expanded === true ? true : false,
        /**
         * @data {Boolean} [false] groupInit
         */
        groupInit: false,
        /**
         * @data {Array} currentExpanded
         */
        currentExpanded: Array.isArray(this.expanded) ? this.expanded : [],
        /**
         * @data {Array} currentExpandedValues
         */
        currentExpandedValues: Array.isArray(this.expandedValues) ? this.expandedValues : [],
        /**
         * @data {Boolean} [false] focusedRow
         */
        focusedRow: false,
        /**
         * @data [null] viewport
         */
        viewport: null,
        /**
         * @data {Array} viewportRows
         */
        viewportRows: [...Array(25).keys()],
        /**
         * @data {Array} viewportCols
         */
        viewportCols: [],
        /**
         * @data {Number} [0] viewportUpdater
         */
        viewportUpdater: 0,
        /**
         * @data {} [null] rowIndexTimeOut
         */
        rowIndexTimeOut: null,
        /**
         * @data {String} containerPadding
         */
        containerPadding: (bbn.fn.getScrollBarSize() ? bbn.fn.getScrollBarSize() : '0') + 'px',
        /**
         * @data {Vue} [null] container
         */
        container: null,
        /**
         * The current scroll top position.
         * @data {Number} [0] currentScrollTop
         */
        currentScrollTop: 0,
        /**
         * @data [null] marginStyleSheet
         */
        marginStyleSheet: null,
        /**
         * @data {String} [bbn.fn.randomString().toLowerCase()] cssRuleName
         */
        cssRuleName: bbn.fn.randomString().toLowerCase(),
        /**
         * @data {String} [false] initStarted
         */
        initStarted: false,
        /**
         * @data [null] inTable
         */
        inTable: null,
        /**
         * @data [null] filterElement
         */
        filterElement: null,
        /**
         * True if the table has horizontal scroll.
         * @data {Boolean} [false] hasHorizontalScroll 
         */
        hasHorizontalScroll: false,
        /**
         * @data {Boolean} [false] hasScrollX 
         */
        hasScrollX: false,
        /**
         * @data {Boolean} [false] hasScrollY
         */
        hasScrollY: false
      };
    },
    computed: {
      /**
       * The array of selected values if the table is selectable.
       * @computed selectedValues
       * @returns {Array}
       */
      selectedValues(){
        return this.currentSelected.map((a) => {
          return this.uid ? this.currentData[a].data[this.uid] : this.currentData[a].data;
        })
      },
      /**
       * The container width.
       * @computed containerWidth
       * @returns {String}
       */
      containerWidth(){
        if ( !this.groupCols || !this.groupCols[1] || !this.groupCols[1].width || !this.lastKnownCtWidth ){
          return '0px';
        }
        return (this.lastKnownCtWidth - this.groupCols[0].width - this.groupCols[2].width) + 'px';
      },
      /**
       * The total width.
       * @computed totalWidth
       * @returns {String}
       */
      totalWidth(){
        if ( !this.groupCols || !this.groupCols[1] || !this.groupCols[1].width || !this.lastKnownCtWidth ){
          return '0px';
        }
        return (this.groupCols[0].width + this.groupCols[1].width + this.groupCols[2].width + 1) + 'px';
      },
      /**
       * Return true if the table isn't ajax, is editable and the edit mode is 'inline'.
       * @computed isBatch
       * @returns {Boolean}
       */
      isBatch() {
        return this.editable && (this.editMode === 'inline') && !this.isAjax
      },
      /**
       * Return true if the table has the prop toolbar defined.
       * @computed hasToolbar
       * @returns {Boolean}
       */
      hasToolbar() {
        return this.toolbarButtons.length || bbn.fn.isObject(this.toolbar) || bbn.fn.isFunction(this.toolbar) || bbn.fn.isString(this.toolbar);
      },
      /**
       * If the computed isBatch is true, return an array of modified rows.
       * @computed modifiedRows
       * @returns {Array}
       */
      modifiedRows() {
        let res = [];
        if (this.isBatch) {
          bbn.fn.each(this.currentData, (d, i) => {
            if (JSON.stringify(d) !== JSON.stringify(this.originalData[i])) {
              res.push(d);
            }
          })
        }
        return res;
      },
      /**
       * Return an array of shown fields (the hidden ones are excluded).
       * @computed shownFields
       * @returns {Array}
       */
      shownFields() {
        let r = [];
        bbn.fn.each(this.cols, (a) => {
          if (a.field && !a.hidden) {
            r.push(a.field);
          }
        });
        return r;
      },
      /**
       * Return the json string of currentConfig.
       * @computed jsonConfig
       * @returns {String}
       */
      jsonConfig() {
        return JSON.stringify(this.currentConfig);
      },
      /**
       * Return true if the saved config is identic to the jsonConfig.
       * @computed isSaved
       * @returns {Boolean}
       */
      isSaved() {
        return this.jsonConfig === this.savedConfig;
      },
      /**
       * Return true if the json string of currentConfig is different from initialConfig
       * @computed isChanged
       * @returns {Boolean}
       */
      isChanged() {
        return JSON.stringify(this.currentConfig) !== this.initialConfig;
      },
      /**
       * Return an array with the object(s) button for the toolbar.
       * @computed toolbarButtons
       * @returns {Array}
       */
      toolbarButtons() {
        let r = [],
          ar = [];
        if (this.toolbar) {
          ar = bbn.fn.isFunction(this.toolbar) ?
            this.toolbar() : (
              Array.isArray(this.toolbar) ? this.toolbar.slice() : []
            );
          if (!Array.isArray(ar)) {
            ar = [];
          }
          bbn.fn.each(ar, (a) => {
            let o = bbn.fn.clone( a);
            if (o.action) {
              o.action = () => {
                this._execCommand(a);
              }
            }
            r.push(o);
          });
        }
        return r;
      },
      /**
       * Return false if a required field of a column is missing.
       * @computed isEditedValid
       * @returns {Boolean}
       */
      isEditedValid() {
        let ok = true;
        if (this.tmpRow) {
          bbn.fn.each(this.columns, (a) => {
            if (a.field && a.required && !this.tmpRow[a.field]) {
              ok = false;
              return false;
            }
          });
        }
        return ok;
      },
      /**
       * Return the number of visible columns of the table.
       * @computed numVisible
       * @returns {number}
       */
      numVisible() {
        return this.cols.length - bbn.fn.count(this.cols, {
          hidden: true
        }) + (this.hasExpander ? 1 : 0) + (this.selection ? 1 : 0);
      },
      /**
       * Return the object scroller.
       * @computed scroller
       * @returns {Object}
       */
      scroller() {
        return this.$refs.scroller instanceof Vue ? this.$refs.scroller : null;
      },
      /**
       * Return an array of objects containing the data of the row and other information about the current view of the table.
       * @computed items
       * @fires _checkConditionsOnValue
       * @fires expandedValues
       * @fires _updateViewport
       * @fires isExpanded
       * @returns {Array}
       */
      items() {
        if (!this.cols.length) {
          return [];
        }
        // The final result
        let res = [],
          isGroup = this.groupable && (this.group !== false) && this.cols[this.group] && this.cols[this.group].field,
          groupField = isGroup ? this.cols[this.group].field : false,
          // The group value will change each time a row has a different value on the group's column
          currentGroupValue,
          /* @todo Not sure of what it does ! */
          currentLink,
          // the data is put in a new array with its original index
          o,
          rowIndex = 0,
          end = this.pageable ? this.currentLimit : this.currentData.length,
          aggregates = {},
          aggregateModes = [],
          i = 0,
          data = this.filteredData;
        // Aggregated
        if (this.isAggregated) {
          aggregateModes = bbn.fn.isArray(this.aggregate) ? this.aggregate : [this.aggregate];
          bbn.fn.each(this.aggregatedColumns, (a) => {
            aggregates[a.field] = {
              tot: 0,
              num: 0,
              min: false,
              max: false,
              groups: []
            };
          });
        }
        // Paging locally
        if (this.pageable && (!this.isAjax || !this.serverPaging)) {
          i = this.start;
          end = this.start + this.currentLimit > data.length ? data.length : this.start + this.currentLimit;
        }
        // Grouping (and sorting) locally
        let pos;
        if (
          isGroup &&
          ((this.isAjax && this.serverGrouping) || (!this.isAjax && this.localGrouping)) &&
          ((pos = bbn.fn.search(this.currentOrder, {
            field: this.cols[this.group].field
          })) !== 0)
        ) {
          // First ordering the data
          let orders = [{
            field: this.cols[this.group].field,
            dir: (pos > 0 ? this.currentOrder[pos].dir : 'asc')
          }];
          if (this.sortable && this.currentOrder.length) {
            orders = orders.concat(JSON.parse(JSON.stringify(this.currentOrder)))
          }
          data = bbn.fn.multiorder(data, orders.map((item) => {
            item.field = 'data.' + item.field;
            return item;
          }));
        }
        // Sorting locally
        else if (this.sortable && this.currentOrder.length && (!this.serverSorting || !this.isAjax)) {
          // If there is a source, we sort based on the text (not the value), so we replace temporary the values
          // with the text + a boundary + the value just the time of sorting
          if (bbn.fn.count(this.cols, {
              source: undefined
            }, '!==')) {
            /** @var will contain the original value of the column to reset it once the array is sorted */
            let tmpData = {};
            bbn.fn.each(this.cols, function (col) {
              if (col.source && col.field) {
                tmpData[col.field] = {};
                bbn.fn.each(data, function (d) {
                  tmpData[col.field][d.index] = d.data[col.field];
                  d.data[col.field] = d.data[col.field] ? bbn.fn.getField(col.source, col.sourceText ? col.sourceText : 'text', col.sourceValue ? col.sourceValue : 'value', d.data[col.field]) || '' : '';
                })
              }
            });
            data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map((item) => {
              item.field = 'data.' + item.field;
              return item;
            }));
            bbn.fn.each(this.cols, (col) => {
              if (col.source && col.field) {
                bbn.fn.each(data, (d, i) => {
                  d.data[col.field] = tmpData[col.field][d.index];
                });
              }
            });
          } else {
            data = bbn.fn.multiorder(data, JSON.parse(JSON.stringify(this.currentOrder)).map((item) => {
              item.field = 'data.' + item.field;
              return item;
            }));
          }
        }

        // A new row being edited
        if (this.tmpRow) {
          res.push({
            index: -1,
            rowIndex: 0,
            data: this.tmpRow,
            selected: false,
            expander: !!this.expander
          });
          this.editedIndex = -1;
          rowIndex++;
        }


        // If there's a group that will be the row index of its 1st value (where the expander is)
        let currentGroupIndex = -1,
          currentGroupRow = -1,
          isExpanded = false,
          groupNumCheckboxes = 0,
          groupNumChecked = 0,
          lastInGroup = false;
        while (data[i] && (i < end)) {
          let a = data[i].data;
          lastInGroup = isGroup && (!data[i + 1] || (data[i + 1].data[groupField] !== currentGroupValue));
          if (isGroup && (currentGroupValue !== a[groupField])) {
            groupNumCheckboxes = 0;
            if (!a[groupField]) {
              currentGroupValue = null;
              currentGroupIndex = -1;
              isExpanded = true;
            } else {
              isExpanded = false;
              currentGroupValue = a[groupField];
              currentGroupIndex = data.index;
              currentGroupRow = res.length;
              let tmp = {
                group: true,
                index: data[i].index,
                value: currentGroupValue,
                data: a,
                rowIndex: rowIndex,
                expander: true,
                num: bbn.fn.count(data, 'data.' + this.cols[this.group].field, currentGroupValue)
              };
              // Expanded is true: all is opened
              if (this.allExpanded) {
                isExpanded = true;
                if (this.currentExpandedValues.indexOf(currentGroupValue) === -1) {
                  this.currentExpandedValues.push(currentGroupValue);
                }
              }
              // expandedValues is a function, which will be executed on each value
              else if (bbn.fn.isFunction(this.expandedValues)) {
                if (
                  this.expandedValues(currentGroupValue) &&
                  (this.currentExpandedValues.indexOf(currentGroupValue) === -1)
                ) {
                  isExpanded = true;
                }
              }
              // The current group value should be opened
              else if (this.currentExpandedValues.indexOf(currentGroupValue) > -1) {
                isExpanded = true;
              }

              if (!isExpanded && data[i - 1] && (currentGroupValue === data[i - 1].data[groupField])) {
                if (res.length) {
                  res.push(tmp);
                }
              } else {
                tmp.expanded = isExpanded;
                res.push(tmp);
                currentLink = i;
                rowIndex++;
              }
            }
          } else if (this.expander) {
            let exp = bbn.fn.isFunction(this.expander) ? this.expander(data[i], i) : this.expander;
            isExpanded = exp ? this.currentExpanded.indexOf(data[i].index) > -1 : false;
          }
          if (!isGroup || isExpanded || !currentGroupValue) {
            o = {
              index: data[i].index,
              data: a,
              rowIndex: rowIndex
            };
            if (isGroup) {
              if (!currentGroupValue) {
                o.expanded = true;
              } else {
                o.isGrouped = true;
                o.link = currentLink;
              }
            } else if (this.expander && (
                !bbn.fn.isFunction(this.expander) ||
                (bbn.fn.isFunction(this.expander) && this.expander(a))
              )) {
              o.expander = true;
            }
            if (this.selection && (!bbn.fn.isFunction(this.selection) || this.selection(o))) {
              o.selected = this.currentSelected.indexOf(data[i].index) > -1;
              o.selection = true;
              groupNumCheckboxes++;
              if (o.selected) {
                groupNumChecked++;
              }
            }
            res.push(o);
            rowIndex++;
          } else {
            end++;
          }
          if (this.expander && (
              !bbn.fn.isFunction(this.expander) ||
              (bbn.fn.isFunction(this.expander) && this.expander(a))
            )) {
            res.push({
              index: data[i].index,
              data: a,
              expansion: true,
              rowIndex: rowIndex
            });
            rowIndex++;
          }
          // Group or just global aggregation

          if (aggregateModes.length) {
            bbn.fn.each(this.aggregatedColumns, (ac) => {
              let aggr = aggregates[ac.field];
              aggr.num++;
              aggr.tot += parseFloat(a[ac.field]);
              if (aggr.min === false) {
                aggr.min = parseFloat(a[ac.field]);
              } else if (aggr.min > parseFloat(a[ac.field])) {
                aggr.min = parseFloat(a[ac.field])
              }
              if (aggr.max === false) {
                aggr.max = parseFloat(a[ac.field]);
              } else if (aggr.max < parseFloat(a[ac.field])) {
                aggr.max = parseFloat(a[ac.field])
              }
              if (isGroup && currentGroupValue) {
                let searchRes = bbn.fn.search(aggr.groups, {
                  value: currentGroupValue
                });
                if (searchRes === -1) {
                  searchRes = aggr.groups.length;
                  aggr.groups.push({
                    value: currentGroupValue,
                    tot: 0,
                    num: 0,
                    min: false,
                    max: false,
                  });
                }
                let b = aggr.groups[searchRes];
                b.num++;
                b.tot += parseFloat(a[ac.field]);
                if (b.min === false) {
                  b.min = parseFloat(a[ac.field]);
                } else if (b.min > parseFloat(a[ac.field])) {
                  b.min = parseFloat(a[ac.field])
                }
                if (b.max === false) {
                  b.max = parseFloat(a[ac.field]);
                } else if (b.max < parseFloat(a[ac.field])) {
                  b.max = parseFloat(a[ac.field])
                }
                if (
                  isExpanded && (
                    (!data[i + 1] || (i === (end - 1))) ||
                    (currentGroupValue !== data[i + 1].data[this.cols[this.group].field])
                  )
                ){
                  let b = aggr.groups[aggr.groups.length - 1];
                  b.med = b.tot / b.num;
                  bbn.fn.each(aggregateModes, (c) => {
                    let tmp = {};
                    tmp[ac.field] = b[c];
                    res.push({
                      index: data[i] ? data[i].index : 0,
                      rowIndex: rowIndex,
                      groupAggregated: true,
                      link: currentLink,
                      value: currentGroupValue,
                      name: c,
                      data: tmp
                    });
                    rowIndex++;
                  });
                }
              }
              if (!data[i + 1] || (i === (end - 1))) {
                aggr.med = aggr.tot / aggr.num;
                bbn.fn.each(aggregateModes, (c) => {
                  let tmp = {};
                  tmp[ac.field] = aggr[c];
                  res.push({
                    index: data[i] ? data[i].index : 0,
                    rowIndex: rowIndex,
                    aggregated: true,
                    name: c,
                    data: tmp
                  });
                  rowIndex++;
                });
              }
            });
          }
          if (isGroup && this.selection && lastInGroup && groupNumCheckboxes) {
            res[currentGroupRow].selection = true;
            res[currentGroupRow].selected = groupNumChecked === groupNumCheckboxes;
          }
          i++;
        }
        let fdata = [];
        res.forEach((d) => {
          if (d.group || d.expander || this.isExpanded(d) || d.aggregated || (this.isExpanded(d) && d.groupAggregated)) {
            fdata.push(d)
          }
        });
        this.$nextTick(() => {
          this._updateViewport();
        });
        return fdata;
      },
      /**
       * Returns true if an expander is defined or if the table is groupable and the group is 'number'.
       * @computed hasExpander
       * @returns {Boolean}
       */
      hasExpander() {
        return this.expander || (
          this.groupable &&
          (typeof this.group === 'number') &&
          this.cols[this.group]
        );
      },
      /**
       * The current columns of the table.
       * @computed currentColumns
       * @returns {Array}
       */
      currentColumns(){
        let r = [];
        bbn.fn.each(this.groupCols, (a, i) => {
          bbn.fn.each(a.cols, (b) => {
            r.push(bbn.fn.extend(true, {}, b, {
              fixed: i !== 1,
              isLeft: i === 0,
              isRight: i === 2,
              realWidth: b.realWidth ? b.realWidth + 'px' : 'auto'
            }));
          });
        });
        return r;
      }
    },
    methods: {
      /**
       * Defines the margin-top.
       * @method _scrollContainer
       * @todo 1px must correspond to the border width
       */
      _scrollContainer(){
        bbn.fn.log("SCROLL CONT");
        this.marginStyleSheet.innerHTML = "."  + this.cssRuleName + "{margin-top: " +
        (this.container.scrollTop ? '-' + (this.container.scrollTop) + 'px' : '') + '}';
      },
      /**
       * Adds the class 'bbn-table-tr-over' to the row of given idx on mouseenter and remove the class on mouse leave.
       * @ignore
       * @method _updateRowIndex
       */
      _updateRowIndex(idx) {

        bbn.fn.each(this.groupCols, (a) => {
          let table = this.getRef(a.name + 'Table');
          if (table && table.tBodies) {
            let trs = this.getRef(a.name + 'Table').tBodies[0].childNodes;
            /*bbn.fn.each(trs, (tr) => {
              tr.classList.remove('bbn-primary')
            })
            if ((idx !== null) && trs[idx]) {
              trs[idx].classList.add('bbn-primary');
            }*/
          }
        });
        //this.currentIndex = idx;
      },
      /**
       * Returns header's CSS object.
       * @method _headStyles
       * @param {Object} col
       * @param {Number} groupIndex
       * @returns {Object}
       */
      _headStyles(col, groupIndex) {
        let css = {
          position: groupIndex === 1 ? 'static' : 'absolute',
          top: 'auto',
          height: 'inherit',
          left: col.left === undefined ? 'auto' : col.left + 'px',
          width: col.realWidth
        };
        if (col.hidden) {
          css.display = 'none';
        }
        return css;
      },
      /**
       * @method _getScrollers
       * @returns {Vue}
       */
      _getScrollers(){
        return [this.getRef('mainTitles')];

      },
      /**
       * Returns body's CSS object
       * @method _bodyStyles
       * @param {Object} col 
       * @returns {Object}
       */
      _bodyStyles(col) {
        return {};
      },
      /**
       * Normalizes the row's data.
       * @method _defaultRow
       * @param initialData
       * @returns {Object}
       */
      _defaultRow(initialData) {
        let res = {},
          data = initialData ? bbn.fn.clone(initialData) : {};
        bbn.fn.each(this.cols, function (a) {
          if (a.field) {
            if (data[a.field] !== undefined) {
              res[a.field] = data[a.field];
            }
            else if (a.default !== undefined) {
              res[a.field] = bbn.fn.isFunction(a.default) ? a.default() : a.default;
            }
            else {
              res[a.field] = '';
            }
            if (bbn.fn.isArray(res[a.field])) {
              res[a.field] = res[a.field].slice();
            }
            else if (res[a.field] instanceof(Date)) {
              res[a.field] = new Date(res[a.field].getTime());
            }
            else if ((null !== res[a.field]) && (typeof res[a.field] === 'object')) {
              res[a.field] = bbn.fn.clone(res[a.field]);
            }
          }
        });
        return res;
      },
      /**
       * Creates the object tmpRow.
       *
       * @method _addTmp
       * @param data
       * @returns {Vue}
       */
      _addTmp(data) {
        this._removeTmp().tmpRow = this._defaultRow(data);
        if (this.$refs.scrollerY) {
          this.$refs.scrollerY.scrollTo(0, null, true);
        }
        return this;
      },
      /**
       * Changes the values of tmpRow to false.
       * @method _removeTmp
       * @returns {Vue}
       */
      _removeTmp() {
        if (this.tmpRow) {
          this.tmpRow = false;
        }
        return this;
      },
      /**
       * Defines if the scroll in the table data part has to be hidden.
       * @method _scrollerHidden
       * @param {Object} groupCol
       * @param {Number} idx
       * @returns {Boolean}
       */
      _scrollerHidden(groupCol, idx) {
        let last = this.groupCols.length === idx - 1;
        if (groupCol.name === 'main') {
          return last ? 'x' : false;
        }
        return last ? 'y' : true;
      },
      /**
       * In a scrollable table, updates the viewport after scrolling the X axis.
       *
       * @method _updateViewport
       * @fires titleGroupsCells
       * @fires getRef
       */
      _updateViewport() {
        if (!this.scrollable) {
          return
        }
        this.keepCool(() => {
          let table = this.getRef('mainTable'),
            scroll = this.getRef('mainScroller'),
            container = scroll ? scroll.getRef('scrollContainer') : null,
            top = container ? container.scrollTop : null,
            left = container ? container.scrollLeft : null,
            viewport = scroll ? bbn.fn.clone(scroll.$el.getBoundingClientRect()) : null;
          if (this.titleGroups && scroll && scroll.getRef('xScroller')) {
            let x = scroll.getRef('xScroller').currentScroll,
              cols = this.titleGroupsCells(this.groupCols[1] && (this.groupCols[1].name === 'main') ? 1 : 0),
              tot = 0;
            bbn.fn.each(cols, (a) => {
              if (tot + a.realWidth > x) {
                if ( this.getRef('mainTitles') && this.getRef('mainTitles').querySelector('.bbn-table-title-group') ){
                  this.getRef('mainTitles').querySelector('.bbn-table-title-group').style.left = tot < x ? x - tot : 0;
                }
                return false;
              }
              tot += a.realWidth;
            });
          }
          return;
          if (!viewport) {
            return;
          }
          viewport.top = top || 0;
          viewport.left = left || 0;
          if (
            this.viewport &&
            (this.viewport.x === viewport.x) &&
            (this.viewport.width === viewport.width) &&
            (this.viewport.y === viewport.y) &&
            (this.viewport.height === viewport.height) &&
            (this.viewport.top === viewport.top) &&
            (this.viewport.left === viewport.left)
          ) {
            return;
          }
          this.viewport = viewport;
          if (table && scroll) {
            let rows = [],
              cols = [];
            if (table && table.rows && table.rows[0] && table.rows[0].cells) {
              bbn.fn.each(this.groupCols[1].cols, (col, idx) => {
                if (table.rows[0].cells[idx]) {
                  let vp = table.rows[0].cells[idx].getBoundingClientRect();
                  if (vp.x > (viewport.x - 300)) {
                    cols.push(col.index);
                  }
                  if (vp.x > (viewport.x + viewport.width + 300)) {
                    // MUST STOP HERE
                    return false;
                  }
                  this.viewportCols.splice(0, this.viewportCols.length, ...cols);
                  this.viewportRows.splice(0, this.viewportRows.length, ...rows);
                  this.updateTable();
                }
              })
            }
          }
        }, '_updateViewport')
      },
      /**
       * Prepares the data to export the table to CSV.
       * @method _export
       * @returns {Array}
       */
      _export() {
        let span = window.document.createElement('span');
        let cols = {};
        let res = [];
        bbn.fn.each(this.currentData, (a) => {
          let o = bbn.fn.clone(a.data);
          let row = [];
          bbn.fn.each(this.cols, (b) => {
            if (!b.hidden && !b.buttons && b.field) {
              if (typeof o[b.field] === 'string') {
                span.innerHTML = o[b.field];
                row.push(span.textContent.trim());
              } else {
                row.push(o[b.field]);
              }
            }
          });
          res.push(row);
        });
        return res;
      },
      /**
       * Executes the action of the button.
       *
       * @method _execCommand
       * @param {Object} button
       * @param {Object} data
       * @param {Object} col
       * @param {Number} index
       * @param {Event} ev
       * @returns {Function|Boolean}
       */
      _execCommand(button, data, col, index, ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
        }
        //bbn.fn.log("EXEC COMMAND");
        if (button.action) {
          if (bbn.fn.isFunction(button.action)) {
            return button.action(data, col, index);
          }
          else if (typeof (button.action) === 'string') {
            switch (button.action) {
              case 'csv':
                return this.exportCSV();
              case 'excel':
                return this.exportExcel();
              case 'insert':
                return this.insert(data, {
                  title: bbn._('New row creation')
                }, -1);
              case 'select':
                return this.select(index);
              case 'edit':
                return this.edit(data, {
                  title: bbn._('Row edition')
                }, index)
              case 'add':
                return this.add(data);
              case 'copy':
                return this.copy(data, {
                  title: bbn._('Row copy')
                }, index);
              case 'delete':
                return this.delete(index);
            }
          }
        }
        return false;
      },
      /**
       * @ignore
       * @todo Not used
       * @method _containerComponent
       * @param {Number} groupIndex
       */
      _containerComponent(groupIndex) {
        return groupIndex === 1 ? {
          template: '<div class="bbn-block"><slot></slot></div>'
        } : bbn.vue.emptyComponent
      },
      /**
       * Exports to csv and download the given filename.
       * @method exportCSV
       * @param {String} filename
       * @param {String} valSep
       * @param {String} rowSep
       * @param {String} valEsc
       * @fires _export
       */
      exportCSV(filename, valSep, rowSep, valEsc) {
        let data = bbn.fn.toCSV(this._export(), valSep, rowSep, valEsc);
        if (!filename) {
          filename = 'export-' + bbn.fn.dateSQL().replace('/:/g', '-') + '.csv';
        }
        bbn.fn.download(filename, data, 'csv');
      },
      /**
       * Exports to excel.
       * @method exportExcel
       * @fires getPostData
       */
      exportExcel(){
        if ( this.isAjax && !this.isLoading ){
          if ( this.pageable ){
            this.getPopup().open({
              title: bbn._('Warning'),
              content: '<div class="bbn-padded bbn-c">' + bbn._('What do you want to export?') + '</div>',
              buttons: [{
                text: bbn._('Cancel'),
                action: () => {
                  this.getPopup().close();
                }
              }, {
                text: bbn._('This view'),
                action: () => {
                  bbn.fn.postOut(this.source, this.getExcelPostData(true));
                  this.getPopup().close();
                }
              }, {
                text: bbn._('All'),
                action: () => {
                  bbn.fn.postOut(this.source, this.getExcelPostData());
                  this.getPopup().close();
                }
              }],
              width: 300
            });
          }
          else {
            this.confirm(bbn._('Are you sure you want to export to Excel?'), () => {
              bbn.fn.postOut(this.source, this.getExcelPostData());
            });
          }
        }
      },
      /**
       * @method getExcelPostData
       * @param {Boolean} currentView 
       * @returns {Object}
       */
      getExcelPostData(currentView){
        let cols = bbn.fn.filter(bbn.fn.extend(true, [], this.cols), c => {
              return (this.shownFields.includes(c.field) && ((c.export === undefined) || !c.export.excluded)) || (c.export && !c.export.excluded);
            }),
            data = {
              excel: {
                fields: bbn.fn.map(cols, c => {
                  return {
                    field: c.field,
                    // check if is present a custom 'title' on column's export property
                    title: c.export && c.export.title ? c.export.title : (c.title || ''),
                    // check if is present a custom 'type' on column's export property
                    type: c.export && c.export.type ? c.export.type : (c.type || 'string'),
                    hidden: (c.export && (c.export.hidden !== undefined)) ? +c.export.hidden : (!this.shownFields.includes(c.field) ? 1 : 0),
                    format: c.export && c.export.format ? c.export.format : null
                  }
                })
              },
              // the current fields
              fields: bbn.fn.map(cols.slice(), f => {
                return f.field
              }),
              limit: currentView ? this.currentLimit : 50000,
              start: currentView ? this.start : 0,
              data: this.getPostData()
            };
        if ( this.sortable ){
          data.order = this.currentOrder;
        }
        if ( this.isFilterable ){
          data.filters = this.currentFilters;
        }
        return data;
      },
      /**
       * Opens a popup showing the database query.
       * @method showQuery 
       */
      showQuery(){
        if (this.currentQuery) {
          this.getPopup().open({
            title: bbn._('Database query and parameters'),
            scrollable: true,
            component: {
              template: `
<div class="bbn-block bbn-spadded">
  <h3 @click="showValues = !showValues"
      v-text="showValues ? _('Hide the values') : _('Show the values')"
      class="bbn-p"></h3>
  <ol class="bbn-space-bottom" v-if="showValues">
    <li v-for="v in source.values" v-text="v"></li>
  </ol>
  <pre v-text="source.query"></pre>
</div>
              `,
              props: ['source'],
              data(){
                return {
                  showValues: false
                }
              }
            },
            closable: true,
            source: {
              query: this.currentQuery,
              values: this.currentQueryValues
            }
          })
        }
      },
      /**
       * Returns true if a column is editable.
       * @method isEditable
       * @param {Object} row
       * @param {Object} col
       * @param {Number} index
       * @returns {Boolean}
       */
      isEditable(row, col, index) {
        if (!this.editable) {
          return false;
        }
        if (bbn.fn.isFunction(col.editable)) {
          return col.editable(row, col, index)
        }
        return col.editable !== false
      },
      /**
       * Returns true if the given row is edited.
       * @method isEdited
       * @param {Object} data
       * @param {Object} col
       * @param {Number} idx
       * @fires isEditable
       * @returns {Boolean}
       */
      isEdited(data, col, idx) {
        return this.isEditable(data, col, idx) &&
          (this.editMode === 'inline') &&
          (this.items[idx].index === this.editedIndex);
      },
      /**
       * Returns the configuration for the cells of the titles of grouped columns.
       * @method titleGroupsCells
       * @param {Number} groupIndex
       * @returns {Array}
       */
      titleGroupsCells(groupIndex) {
        if (this.titleGroups) {
          let cells = [],
            group = null,
            corresp = {};
          bbn.fn.each(this.groupCols[groupIndex].cols, (a) => {
            if (!a.hidden) {
              if (a.group === group) {
                cells[cells.length - 1].colspan++;
                cells[cells.length - 1].width += a.realWidth;
              } else {
                if (corresp[a.group] === undefined) {
                  let idx = bbn.fn.search(this.titleGroups, 'value', a.group);
                  if (idx > -1) {
                    corresp[a.group] = idx;
                  }
                }
                if (corresp[a.group] !== undefined) {
                  cells.push({
                    text: this.titleGroups[corresp[a.group]].text || '&nbsp;',
                    style: this.titleGroups[corresp[a.group]].style || {},
                    cls: this.titleGroups[corresp[a.group]].cls || '',
                    colspan: 1,
                    width: a.realWidth
                  });
                }
                /*
                else if ( this.titleGroups.default ){
                  cells.push({
                    text: this.titleGroups.default.text || '&nbsp;',
                    style: this.titleGroups.default.style || {},
                    cls: this.titleGroups.default.cls || '',
                    colspan: 1,
                    width: a.realWidth
                  });
                }
                */
                else {
                  cells.push({
                    text: '&nbsp;',
                    style: '',
                    cls: '',
                    colspan: 1,
                    width: a.realWidth
                  });
                }
                group = a.group;
              }
            }
          });
          return cells;
        }
      },
      /**
       * Returns true if the table has currentFilters defined for the given column.
       * @method hasFilter
       * @param {Object} col The column
       * @returns {Boolean}
       */
      hasFilter(col) {
        if (col.field) {
          for (let i = 0; i < this.currentFilters.conditions.length; i++) {
            if (this.currentFilters.conditions[i].field === col.field) {
              return true;
            }
          }
        }
        return false;
      },
      /**
       * The behavior of the component at mouseMove.
       * @method moveMouse
       * @param {Event} e
       * @fires keepCool
       * @fires checkFilterWindow
       */
      moveMouse(e) {
        this.keepCool(() => {
          this.checkFilterWindow(e);

        }, 'moveMouse')
      },
      /**
       * Handles the floatingFilterTimeOut.
       * @method checkFilterWindow
       * @param {Event} e
       */
      checkFilterWindow(e) {
        if (this.currentFilter) {
          if (this.floatingFilterTimeOut) {
            clearTimeout(this.floatingFilterTimeOut);
          }
          if (
            (e.clientX < this.floatingFilterX) ||
            (e.clientX > this.floatingFilterX + 600) ||
            (e.clientY < this.floatingFilterY) ||
            (e.clientY > this.floatingFilterY + 200)
          ) {
            if (!this.floatingFilterTimeOut) {
              this.floatingFilterTimeOut = setTimeout(() => {
                this.currentFilter = false;
                this.editedFilter = false;
              }, 500);
            }
          } else {
            this.floatingFilterTimeOut = 0;
          }
        }
      },
      /**
       * Retuns the popup object.
       * @method getPopup
       * @returns {Vue}
       */
      getPopup(){
        return this.popup || bbn.vue.getPopup(this);
      },
      /**
       * Returns the options for the bind of the table filter.
       *
       * @method getFilterOptions
       * @fires getColFilters
       * @returns {Object}
       */
      getFilterOptions() {
        if (this.currentFilter) {
          let o = this.editorGetComponentOptions(this.currentFilter);
          if (o.field) {
            o.conditions = this.getColFilters(this.currentFilter);
          }
          if (o.conditions.length) {
            o.value = o.conditions[0].value;
            o.operator = o.conditions[0].operator;
            this.editedFilter = o.conditions[0];
          }
          o.multi = false;
          return o;
        }
      },
      /**
       * Opens the popup containing the multifilter.
       * @method openMultiFilter
       */
      openMultiFilter() {
        this.currentFilter = false;
        let table = this;
        this.getPopup().open({
          title: bbn._('Multiple filters'),
          component: {
            template: `<bbn-scroll><bbn-filter v-bind="source" @change="changeConditions" :multi="true"></bbn-filter></bbn-scroll>`,
            props: ['source'],
            methods: {
              changeConditions(o) {
                table.currentFilters.logic = o.logic;
                table.currentFilters.conditions = o.conditions;
              }
            },
          },
          width: '90%',
          height: '90%',
          source: {
            fields: bbn.fn.filter(this.cols, (a) => {
              return (a.filterable !== false) && !a.buttons;
            }),
            conditions: this.currentFilters.conditions,
            logic: this.currentFilters.logic
          }
        });
      },
      /**
       * Returns the filter of the given column.
       * @method getColFilters
       * @param {Object} col
       * @returns {Object}
       */
      getColFilters(col) {
        let r = [];
        if (col.field) {
          bbn.fn.each(this.currentFilters.conditions, (a) => {
            if (a.field === col.field) {
              r.push(a);
            }
          })
        }
        return r;
      },
      /**
       * Shows the filter of the column.
       * @method showFilter
       * @param {Object} col
       * @param {Event} ev
       */
      showFilter(col, ev) {
        //bbn.fn.log(ev);
        this.floatingFilterX = ev.pageX - 10 < 0 ? 0 : (ev.pageX - 10 + 600 > this.$el.clientWidth ? this.$el.clientWidth - 600 : ev.pageX - 10);
        this.floatingFilterY = ev.pageY - 10 < 0 ? 0 : (ev.pageY - 10 + 200 > this.$el.clientHeight ? this.$el.clientHeight - 200 : ev.pageY - 10);
        this.currentFilter = col;
      },
      /**
       * Returns the list of the showable columns
       * @method pickableColumnList
       * @returns {Array}
       */
      pickableColumnList() {
        return this.cols.slice().map((a) => {
          return a.showable !== false;
        });
      },
      /**
       * Opens the popup containing the column picker.
       * @method openColumnsPicker
       */
      openColumnsPicker() {
        let table = this;
        this.getPopup().open({
          title: bbn._("Columns' picker"),
          height: '90%',
          width: '90%',
          component: {
            template: `
<div class="bbn-table-column-picker">
  <bbn-form ref="scroll"
            :source="formData"
            :scrollable="true"
            :prefilled="true"
            @success="applyColumnsShown">
    <div class="bbn-padded">
      <ul v-if="source.titleGroups">
        <li v-for="(tg, idx) in source.titleGroups">
          <h3>
            <bbn-checkbox :checked="allVisible(tg.value)"
                          @change="checkAll(tg.value)"
                          :label="tg.text"
            ></bbn-checkbox>
          </h3>
          <ul>
            <li v-for="(col, i) in source.cols"
                v-if="!col.fixed && (col.group === tg.value) && (col.showable !== false) && (col.title || col.ftitle)"
            >
              <bbn-checkbox :checked="shownCols[i]"
                            @change="check(col, i)"
                            :label="col.ftitle || col.title"
                            :contrary="true"
              ></bbn-checkbox>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-else>
        <li v-for="(col, i) in source.cols"
            v-if="!col.fixed && (col.showable !== false) && (col.title || col.ftitle)"
        >
          <bbn-checkbox :checked="shownCols[i]"
                        @change="check(col, i)"
                        :label="col.ftitle || col.title"
                        :contrary="true"
          ></bbn-checkbox>
        </li>
      </ul>
    </div>
  </bbn-form>
</div>
`,
            props: ['source'],
            data() {
              let shownColumns = this.source.cols.map(a => !a.hidden);
              return {
                table: table,
                formData: {
                  changed: false
                },                
                shownCols: shownColumns
              }
            },
            methods: {
              applyColumnsShown() {
                let toShow = [],
                  toHide = [];
                bbn.fn.each(this.source.cols, (a, i) => {
                  if (a.hidden == this.shownCols[i]) {
                    if (this.shownCols[i]) {
                      toShow.push(i);
                    } else {
                      toHide.push(i);
                    }
                  }
                });
                if (toShow.length) {
                  table.show(toShow);
                }
                if (toHide.length) {
                  table.show(toHide, true);
                }
              },
              allVisible(group) {
                let ok = true;
                //bbn.fn.log("allVisible", group);
                bbn.fn.each(this.source.cols, (a, i) => {
                  if (
                    (a.showable !== false) &&
                    (a.group === group) &&
                    !a.fixed
                  ) {
                    if (!this.shownCols[i]) {
                      ok = false;
                      //bbn.fn.log("NOT ALL VISIBLE!!!!!!!!!!!!!!!!!!!!!!", a);
                      return false;
                    }
                  }
                });
                return ok;
              },
              check(col, index) {
                this.$set(this.shownCols, index, !this.shownCols[index]);
              },
              checkAll(group) {
                let show = !this.allVisible(group),
                  shown = [];
                bbn.fn.each(this.source.cols, (a, i) => {
                  if ((a.showable !== false) && (a.group === group) && !a.fixed) {
                    if (this.shownCols[i] != show) {
                      this.shownCols.splice(i, 1, show);
                    }
                  }
                });
                this.$forceUpdate();
              }
            },
            watch: {
              shownCols: {
                deep: true,
                handler() {
                  this.formData.changed = true;
                }
              }              
            }
          },
          source: {
            cols: this.cols,
            titleGroups: this.titleGroups
          }
        });
      },
      /**
       * Opens the popup containing the form to edit the row.
       * @method edit
       * @param {Object} row
       * @param {String|Object} winOptions
       * @param {Number} index
       * @fires _addTmp
       */
      edit(row, winOptions, index) {
        let rowIndex = index;
        if (!this.editable) {
          throw new Error("The table is not editable, you cannot use the edit function in bbn-table");
        }
        if ( !winOptions ){
          winOptions = {};
        }
        if (!row) {
          this._addTmp();
          row = this.tmpRow;
        }
        this.originalRow = bbn.fn.clone(row);
        // EditedRow exists from now on the time of the edition
        this.editedRow = row;
        
        if (this.items[index]) {
          this.editedIndex = this.items[index].index;
        }
        if (this.editMode === 'popup') {
          if (typeof (winOptions) === 'string') {
            winOptions = {
              title: winOptions
            };
          }
          if (!winOptions.height) {
            //winOptions.height = (this.cols.length * 2) + 'rem'
          }
          if (winOptions.maximizable === undefined) {
            winOptions.maximizable = true;
          }
          let popup = bbn.fn.extend({
            source: {
              row: row,
              data: bbn.fn.isFunction(this.data) ? this.data() : this.data
            }
          }, {
            title: bbn._('Row edition'),
            width: 700
          }, winOptions ? winOptions : {});
          // A component is given as global editor (form)
          if (this.editor) {
            popup.component = this.editor;
          }
          // A URL is given and in this case the form will be created automatically with this URL as action
          else if (this.url) {
            let table = this;
            let o = bbn.fn.extend({}, this.data, {
              action: table.tmpRow ? 'insert' : 'update'
            });
            popup.component = {
              data() {
                let fields = [];
                table.cols.map((a) => {
                  let o = bbn.fn.extend(true, {}, a);
                  if (o.ftitle) {
                    o.title = o.ftitle;
                  }
                  fields.push(o);
                });
                return {
                  // Table's columns are used as native form config
                  fields: fields,
                  data: row,
                  obj: o
                }
              },
              template: `
<bbn-form action="` + table.url + `"
          :schema="fields"
          :scrollable="false"
          :source="data"
          :data="obj"
          @success="success"
          @failure="failure">
</bbn-form>`,
              methods: {
                success(d, e) {
                  e.preventDefault();
                  if (table.successEdit(d)) {
                    table.getPopup().close();
                  }
                },
                failure(d) {
                  table.$emit('editFailure', d);
                },
              },
            };
          } else {
            throw new Error(bbn._("Impossible to open a window if either an editor or a URL is not set"))
          }
          popup.afterClose = () => {
            //  this.currentData.push(bbn.fn.clone( this.tmpRow)); // <-- Error. This add a new row into table when it's in edit mode
            this._removeTmp();
            this.editedRow = false;
            this.editedIndex = false;
          };
          this.getPopup().open(popup);
        }
      },
      /**
       * After the post in case of edit of the row, update the row in originalData.
       *
       * @method successEdit
       * @param {Object} d
       * @emit editSuccess
       * @fires saveRow
       * @returns {Boolean}
       */
      successEdit(d) {
        let ev = new Event('editSuccess', {cancelable: true});
        this.$emit('editSuccess', d, ev);
        if (d.success && !ev.defaultPrevented) {
          if (d.data) {
            //bbn.fn.log(d.data);
            bbn.fn.iterate(d.data, (o, n) => {
              this.editedRow[n] = o;
            });
          }
          this.saveRow();
          return true;
        }
        return false;
      },
      /**
       * Insert or update a row in originalData.
       * @method saveRow
       * @emit saverow
       */
      saveRow() {
        // New insert
        let ev = new Event('saverow', {cancelable: true});
        this.$emit('saverow', this.tmpRow || this.editedRow, ev);
        if (!ev.defaultPrevented) {
          if (this.tmpRow) {
            this.currentData.push({
              data: bbn.fn.clone(this.tmpRow),
              index: this.currentData.length
            });
            if (this.originalData) {
              this.originalData.push(bbn.fn.clone(this.tmpRow));
            }
            this.tmpRow = false;
          }
          // Update
          else if (this.editedRow) {
            this.$set(this.currentData[this.editedIndex], 'data', bbn.fn.clone(this.editedRow));
            if (this.originalData) {
              this.originalData.splice(this.editedIndex, 1, bbn.fn.clone(this.editedRow));
            }
            this.editedRow = false;
          }
          return true;
        }
        return false;
      },      
      /**
       * If the prop url of the table is defined makes a post to the url to update or insert the row, else fires the method saveRow to insert or update the row in originalData.
       * @method saveInline
       * @fires saveRow
       *
       */      
      saveInline() {
        if (this.tmpRow || this.editedRow) {          
          if (this.url) {
            let o = bbn.fn.extend({}, this.data, this.tmpRow || this.editedRow, {
              action: this.tmpRow ? 'insert' : 'update'
            });
            this.post(this.url, o, (d) => {
              this.successEdit(d);
            })
          }
          else if (this.saveRow()) {
            this.$emit(this.tmpRow ? 'insert' : 'edit');
          }
        }
      },      
      /**
       * Returns wheter or not the cell is grouped.
       * @method isGroupedCell
       * @param {Number} groupIndex
       * @param {Object} row
       * @returns {Boolean}
       */
      isGroupedCell(groupIndex, row) {
        if (this.groupable && row.group) {
          if (this.groupCols[0].width > 200) {
            return groupIndex === 0;
          } else {
            return groupIndex === 1;
          }
        }
        return false;
      },
      /**
       * Returns the current configuration of the table.
       * @method getConfig
       * @returns {Object}
       */
      getConfig() {
        return {
          limit: this.currentLimit,
          order: this.currentOrder,
          filters: this.currentFilters,
          hidden: this.currentHidden
        };
      },
      /**
       * Returns the columns configuration.
       * @method getColumnsConfig
       * @returns {Array}
       */
      getColumnsConfig() {
        return JSON.parse(JSON.stringify(this.cols));
      },
      /**
       * Sets the current config of the table.
       * @method setConfig
       * @param {Object} cfg
       * @param {Boolean} no_storage
       * @fires getConfig
       * @fires setStorage
       */
      setConfig(cfg, no_storage) {
        if (cfg === false) {
          cfg = bbn.fn.clone(this.defaultConfig);
        }
        else if (cfg === true) {
          cfg = this.getConfig();
        }
        if (cfg && cfg.limit) {
          if (this.filterable && cfg.filters && (this.currentFilters !== cfg.filters)) {
            this.currentFilters = cfg.filters;
          }
          if (this.pageable && (this.currentLimit !== cfg.limit)) {
            this.currentLimit = cfg.limit;
          }
          if (this.sortable && (this.currentOrder !== cfg.order)) {
            this.currentOrder = cfg.order;
          }
          if (this.showable) {
            if ((cfg.hidden !== undefined) && (cfg.hidden !== this.currentHidden)) {
              this.currentHidden = cfg.hidden;
            }
            bbn.fn.each(this.cols, (a, i) => {
              let hidden = (this.currentHidden.indexOf(i) > -1);
              if (a.hidden !== hidden) {
                //bbn.fn.log("CHANGING HIDDEN");
                this.$set(this.cols[i], 'hidden', hidden);
              }
            });
          }
          this.currentConfig = {
            limit: this.currentLimit,
            order: this.currentOrder,
            filters: this.currentFilters,
            hidden: this.currentHidden
          };
          if (!no_storage) {
            this.setStorage(this.currentConfig);
          }

          this.$forceUpdate();
        }
      },
      /**
       * Saves the current configuration.
       * @method save
       */
      save() {
        this.savedConfig = this.jsonConfig;
      },
      /**
       * Adds the given data to the object tmpRow and opens the popup with the form to insert the row.
       * @method insert
       * @param {Object} data
       * @param {Object} options
       * @param {Number} index
       * @fires _addTmp
       * @fires edit
       */
      insert(data, options, index) {
        let d = data ? bbn.fn.clone(data) : {};
        if (this.uid && d[this.uid]) {
          delete d[this.uid];
        }
        this._addTmp(d, index);
        this.edit(this.tmpRow, options, index);
      },
      /**
       * Adds the given data to the object tmpRow and opens the popup with the form to copy the row.
       * @method copy
       * @param {Object} data
       * @param {Object} options
       * @param {Number} index
       * @fires _addTmp
       * @fires edit
       */
      copy(data, options, index) {
        let r = bbn.fn.clone(data);
        if (this.uid && r[this.uid]) {
          delete r[this.uid];
        }
        this._addTmp(r);
        this.edit(this.tmpRow, options, index);
      },
      /**
       * Emits 'select',  'unselect' or 'toggle' at change of checkbox of the row in a selectable table.
       * @method checkSelection
       * @param {Number} index
       * @emit unselect
       * @emit select
       * @emit toggle
       */
      checkSelection(index) {
        let row = this.items[index];
        if (row && this.groupable && row.group) {
          if (row.expanded) {
            bbn.fn.fori((d, i) => {
              if (d && d.selection && (d.data[this.cols[this.group].field] === row.value)) {
                this.checkSelection(i)
              }
            }, this.items, index + row.num, index + 1)
          }
          return;
        }
        if (row && row.selection) {
          let idx = this.currentSelected.indexOf(row.index),
            isSelected = false;
          if (idx > -1) {
            this.$emit('unselect', row.data);
            this.currentSelected.splice(idx, 1);
          } else {
            this.$emit('select', row.data);
            this.currentSelected.push(row.index);
            isSelected = true;
          }
          this.$emit('toggle', isSelected, this.currentData[row.index].data);
        }
      },
      /**
       * Refresh the current data set.
       *
       * @method updateData
       * @param withoutOriginal
       * @fires _removeTmp
       * @fires init
       */
      updateData(withoutOriginal) {
        /** Mini reset?? */
        this.currentExpanded = [];
        this._removeTmp();
        this.editedRow = false;
        this.editedIndex = false;
        this.$forceUpdate();
        return bbn.vue.listComponent.methods.updateData.apply(this, [withoutOriginal]).then(() => {
          if (this.currentData.length && this.selection && this.currentSelected.length) {
            this.currentSelected = [];
          }
          if (this.editable) {
            this.originalData = JSON.parse(JSON.stringify(this.currentData.map((a) => {
              return a.data;
            })));
          }
          setTimeout(() => {
            this.init();
          })
        });
      },
      /**
       * Return true if the given row is changed from originalData.
       * @method isDirty
       * @param {Object} row
       * @param {Object} col
       * @param {Number} idx
       */
      isDirty(row, col, idx) {
        return this.isBatch &&
          col &&
          (row.index !== this.editedIndex) &&
          !row.aggregated &&
          !row.groupAggregated &&
          (col.editable !== false) &&
          col.field &&
          (row.data[col.field] != this.originalData[row.index][col.field])
      },
      /**
       * Returns the css class of the given column.
       * @method currentClass
       * @param {Object} column
       * @param {Object} data
       * @param {Number} index
       */
      currentClass(column, data, index) {
        if (column.cls) {
          return bbn.fn.isFunction(column.cls) ? column.cls(data, index, column) : column.cls;
        }
        return '';
      },
      /**
       * Returns true if the row corresponding to the given index has changed respect to originalData.
       * @method isModified
       * @param {Number} idx
       * @returns {Boolean}
       */
      isModified(idx) {
        if (!this.originalData) {
          return false;
        }
        let data = [];
        let orig;
        if ( this.filteredData[idx] === undefined ){
          bbn.fn.each(this.currentData, (a) => data.push(a.data));
          orig = this.originalData;
        }
        else{
          data = this.filteredData[idx].data;
          orig = this.originalData[idx];
        }
        return JSON.stringify(data) !== JSON.stringify(orig);
      },
      /**
       * Returns true if the given column is sorted.
       * @method isSorted
       * @param {Object} col
       */
      isSorted(col) {
        if (
          this.sortable &&
          (col.sortable !== false) &&
          !col.buttons &&
          col.field
        ) {
          let idx = bbn.fn.search(this.currentOrder, {
            field: col.field
          });
          if (idx > -1) {
            return this.currentOrder[idx];
          }
        }
        return false;
      },
      /**
       * Sorts the given column.
       * @method sort
       * @param {Object} col
       * @fires updateData
       */
      sort(col) {
        if (
          !this.isLoading &&
          this.sortable &&
          col.field &&
          (col.sortable !== false)
        ) {
          let f = col.field,
            pos = bbn.fn.search(this.currentOrder, {
              field: f
            });
          if (pos > -1) {
            if (this.currentOrder[pos].dir === 'ASC') {
              this.currentOrder[pos].dir = 'DESC';
            } else {
              this.currentOrder.splice(0, this.currentOrder.length);
            }
          } else {
            this.currentOrder.splice(0, this.currentOrder.length);
            this.currentOrder.push({
              field: f,
              dir: 'ASC'
            });
          }
          if (this.isAjax) {
            this.updateData();
          }
        }
      },
      /**
       * Handles the table resize.
       * @method updateTable
       * @fires keepCool
       * @emit resize
       */
      updateTable() {
        if (!this.isLoading) {
          this.keepCool(() => {
            // Equalizing the height of the cells in case of fixed columns
            if (this.groupCols[0].cols.length || this.groupCols[2].cols.length) {
              let ele = this.getRef('table');
              if ( ele && ele.tBodies ){
                bbn.fn.each(ele.tBodies[0].rows, (row) => {
                  let todo = [row];
                  bbn.fn.each(row.cells, (cell) => {
                    todo.push(cell);
                  });
                  this.$nextTick(() => {
                    bbn.fn.adjustHeight(todo);
                  })
                });
              }
            }
          }, 'updateTable', 100);
        }
      },
      /**
       * Renders a cell according to column's config.
       * @method render
       * @param {Object} data
       * @param {Object} column
       * @param {Number} index
       * @fires renderData
       * @returns {Function}
       */
      render(data, column, index) {
        let value = data && column.field ? data[column.field] || '' : undefined;
        if (column.render) {
          return column.render(data, column, index, value)
        }
        return this.renderData(data, column, index);
      },
      /**
       * Cancels the changes made on the row data.
       * @method cancel
       * @fires _removeTmp
       */
      cancel() {
        if (this.tmpRow) {
          this._removeTmp();
        } else if (this.editedRow && this.originalRow) {
          if (this.currentData[this.editedIndex]) {
            this.currentData[this.editedIndex].data = this.originalRow;
          }
        }
        this.originalRow = false;
        this.editedRow = false;
        this.editedIndex = false;
      },
      /**
       * @ignore
       * @todo not used
       * @method editTmp
       * @param {Object} data
       */
      editTmp(data) {
        if (this.tmpRow) {
          data = bbn.fn.extend(this.tmpRow, data);
        }
        return this;
      },
      /**
       * @ignore
       * @method saveTmp
       */
      saveTmp() {},
      /**
       * Returns a dimension in pixels of the given param.
       * @method getWidth
       * @param {Number|String} w The width
       * @returns {String}
       */
      getWidth(w) {
        if (typeof (w) === 'number') {
          return (w > 19 ? w : 20) + 'px';
        }
        if (bbn.fn.isDimension(w)) {
          return w;
        }
        return '100px';
      },
      /**
       * Resets configuration of the table.
       * @method reset
       * @param noCfg
       * @fires setConfig
       * @fires init
       */
      reset(noCfg) {
        this.initReady = false;
        if (!noCfg) {
          this.setConfig(false);
        }
        this.$nextTick(() => {
          this.init();
        })
      },
      /**
       * Adds the given column to table's configuration
       * @method addColumn
       * @param {Object} obj
       */
      addColumn(obj) {
        if (obj.aggregate && !Array.isArray(obj.aggregate)) {
          obj.aggregate = [obj.aggregate];
        }
        this.cols.push(obj);
      },
      /**
       * Return true if the cell is before aggregated cells.
       * @method isBeforeAggregated
       * @param {Number} groupIndex
       * @param {Number} idx
       * @returns {Boolean}
       */
      isBeforeAggregated(groupIndex, idx) {
        return this.isAggregated && ((
            this.groupCols[groupIndex].cols[idx + 1] &&
            (this.groupCols[groupIndex].cols[idx + 1].field === this.isAggregated)
          ) ||
          (
            !this.groupCols[groupIndex].cols[idx + 1] &&
            this.groupCols[groupIndex + 1] &&
            this.groupCols[groupIndex + 1].cols[0] &&
            (this.groupCols[groupIndex + 1].cols[0].field === this.isAggregated)
          ));
      },
      /**
       * Handles the resize and reinitializes the table.
       * @method onResize
       * @fires init
       */
      onResize() {
        this.resizeHeight();
        this.init();
      },
      /**
       * Handles the resize.
       * @method resizeHeight
       */
      resizeHeight(){
        if ( this.scrollable ){
          let ct = this.getRef('container');
          this.updateTable();
          if ( ct ){
            ct.style.height = ct.parentNode.clientHeight + 'px';
            this.$nextTick(() => {
              let x = this.getRef('xScroller');
              let y = this.getRef('yScroller');
              if ( x ){
                x.onResize();
              }
              if ( y ){
                y.onResize();
              }
            })
          }
        }
      },
      /**
       * Returns an array containing the scrollcontainer of each items of groupCols.
       * @method dataScrollContents
       * @fires getRef
       * @returns {Array}
       */
      dataScrollContents() {
        if (!this.groupCols[0].cols.length && !this.groupCols[2].cols.length) {
          return null;
        }
        let r = [];
        bbn.fn.each(this.groupCols, (a) => {
          let sc = this.getRef(a.name + 'Scroller');
          if (a.cols.length && sc && sc.getRef('scrollContainer')) {
            r.push(sc.getRef('scrollContainer'));
          }
        });
        return r;
      },
      /**
       * Returns if the given row is expanded.
       * @method isExpanded
       * @param {Object} d
       * @returns {boolean}
       */
      isExpanded(d) {
        if (this.allExpanded) {
          return true;
        }
        if (!this.expander && ((this.group === false) || !this.groupable)) {
          return true;
        }
        if (this.expander) {
          return this.currentExpanded.indexOf(d.index) > -1;
        }
        if (
          this.groupable &&
          (this.group !== false) &&
          this.cols[this.group] &&
          this.cols[this.group].field
        ) {
          if (d.data[this.cols[this.group].field]) {
            return this.currentExpandedValues.indexOf(d.data[this.cols[this.group].field]) > -1;
          }
          return true;
        }
        if ((d.isGrouped || d.groupAggregated) && (this.currentExpanded.indexOf(d.link) > -1)) {
          return true;
        }
        return false;
      },
      /**
       * Toggles the expander of the row corresponding to the given idx.
       * @method toggleExpanded
       * @param {Number} idx
       */
      toggleExpanded(idx) {
        if (this.currentData[idx]) {
          if (this.allExpanded) {
            this.allExpanded = false;
          }
          if (
            this.groupable &&
            (this.group !== false) &&
            this.cols[this.group] &&
            this.cols[this.group].field &&
            (this.currentData[idx].data[this.cols[this.group].field] !== undefined)
          ) {
            let groupValue = this.currentData[idx].data[this.cols[this.group].field],
              groupIndex = this.currentExpandedValues.indexOf(groupValue);
            if (groupIndex > -1) {
              this.currentExpandedValues.splice(groupIndex, 1);
            } else {
              this.currentExpandedValues.push(groupValue);
            }
          } else {
            let i = this.currentExpanded.indexOf(idx);
            if (i > -1) {
              this.currentExpanded.splice(i, 1);
            } else {
              this.currentExpanded.push(idx);
            }
          }
        }
      },
      /**
       * Returns wheter or not the given row has the expander.
       * @method rowHasExpander
       * @param d
       * @returns {Boolean}
       */
      rowHasExpander(d) {
        if (this.hasExpander) {
          if (!bbn.fn.isFunction(this.expander)) {
            return true;
          }
          return !!this.expander(d);
        }
        return false;
      },
      /**
       * Returns true if the given index is selected.
       * @method isSelected
       * @param {Number} index
       * @returns {Boolean}
       */
      isSelected(index) {
        return this.selection && (this.currentSelected.indexOf(index) > -1);
      },
      /**
       * Returns true if the given row has td.
       *
       * @method hasTd
       * @param {Object} data
       * @param {Number} colIndex
       * @param {Number} groupIndex
       */
      hasTd(data, colIndex, groupIndex) {
        let tdIndex = colIndex;
        for (let i = 0; i < groupIndex; i++) {
          tdIndex += this.groupCols[groupIndex].cols.length;
        }
        if (data.selection) {
          if (tdIndex === 0) {
            return false;
          } else if (data.group || data.expander) {
            if (tdIndex === 1) {
              return false;
            }
          }
        }
        if (data.group || data.expander) {
          if (tdIndex === 0) {
            return false;
          }
        }
        if (data.group || data.expansion) {
          return false;
        }
        if (data.hidden) {
          return false;
        }
        return true;
      },
      /**
       * Initializes the table.
       * @method init
       * @param {Boolean} with_data
       * @fires updateData
       * @fires keepCool
       */
      init(with_data) {
        this.keepCool(() => {
          let groupCols = [
                {
                  name: 'left',
                  width: 0,
                  visible: 0,
                  cols: []
                },
                {
                  name: 'main',
                  width: 0,
                  visible: 0,
                  cols: []
                },
                {
                  name: 'right',
                  width: 0,
                  visible: 0,
                  cols: []
                }
              ],
              numUnknown = 0,
              colButtons = false,
              isAggregated = false,
              aggregatedColIndex = false,
              aggregatedColTitle = false,
              aggregatedColumns = [];
          this.groupCols = bbn.fn.clone(groupCols);
          bbn.fn.each(this.cols, (a) => {
            a.realWidth = 0;
          });
          this.initStarted = true;
          this.$nextTick(() => {
            this.setResizeMeasures();
            bbn.fn.each(this.cols, (a, i) => {
              if (!a.hidden && (!this.groupable || (this.group !== i))) {
                a.index = i;
                if (a.hidden) {
                  a.realWidth = 0;
                }
                else {
                  if (this.aggregate && a.aggregate ) {
                    if ( aggregatedColIndex === false ){
                      aggregatedColIndex = i;
                      isAggregated = true;
                    }
                    aggregatedColumns.push(a);
                  }
                  if ( a.width ){
                    if ((typeof (a.width) === 'string') && (a.width.substr(-1) === '%')) {
                      a.realWidth = Math.floor(this.lastKnownCtWidth * parseFloat(a.width) / 100);
                    }
                    else {
                      a.realWidth = parseFloat(a.width);
                    }
                    if ( a.realWidth < this.minimumColumnWidth ){
                      a.realWidth = this.minimumColumnWidth;
                    }
                  }
                  else {
                    a.realWidth = this.minimumColumnWidth;
                    numUnknown++;
                  }
                  if ( a.buttons !== undefined ) {
                    colButtons = i;
                  }
                  if ( a.fixed ){
                    if (
                      (a.fixed !== 'right') &&
                      ((this.fixedDefaultSide !== 'right') || (a.fixed === 'left'))
                    ) {
                      groupCols[0].cols.push(a);
                      if (!a.hidden) {
                        groupCols[0].visible++;
                      }
                    }
                    else {
                      groupCols[2].cols.push(a);
                      if (!a.hidden) {
                        groupCols[2].visible++;
                      }
                    }
                  }
                  else {
                    groupCols[1].cols.push(a);
                    if (!a.hidden) {
                      groupCols[1].visible++;
                    }
                  }
                }
              }
            });
            let firstGroup = groupCols[0].visible ? 0 : 1;
            if (this.hasExpander) {
              let o = {
                isExpander: true,
                title: ' ',
                filterable: false,
                width: this.minimumColumnWidth,
                realWidth: this.minimumColumnWidth
              };
              if ( firstGroup === 0 ){
                o.fixed = true;
                o.isLeft = true;
              }
              groupCols[firstGroup].cols.unshift(o);
              groupCols[firstGroup].visible++;
            }
            if ( this.selection ) {
              let o = {
                isSelection: true,
                title: ' ',
                filterable: false,
                width: 40,
                realWidth: 40
              };
              if ( firstGroup === 0 ){
                o.fixed = true;
                o.isLeft = true;
              }
              groupCols[firstGroup].cols.unshift(o);
              groupCols[firstGroup].visible++;
            }

            let tot = 0;
            bbn.fn.each(groupCols, (a) => {
              a.sum = bbn.fn.sum(a.cols, 'realWidth');
              tot += a.sum;
            });

            let clientWidth = this.lastKnownCtWidth,
            toFill = clientWidth - tot - 1;
            // We must arrive to 100% minimum
            if (toFill > 0) {
              if (numUnknown) {
                let newWidth = Math.floor(
                  (toFill) /
                  numUnknown *
                  100
                ) / 100;
                if (newWidth < this.minimumColumnWidth) {
                  newWidth = this.minimumColumnWidth;
                }
                let maxPreAggregatedWidth = 0;
                bbn.fn.each(this.cols, (a, i) => {
                  if (!a.hidden) {
                    if (!a.width) {
                      a.realWidth = newWidth + this.minimumColumnWidth;
                    }
                    if ( isAggregated && (i < aggregatedColIndex) && (a.realWidth >= maxPreAggregatedWidth) ){
                      maxPreAggregatedWidth = a.realWidth;
                      aggregatedColTitle = a;
                    }
                  }
                });
              }
              // Otherwise we dispatch it through the existing column
              else {
                let num = this.numVisible;
                let ignore = 0;
                if ( this.hasExpander ){
                  num--;
                  ignore++;
                }
                if ( this.selection ){
                  num--;
                  ignore++;
                }
                let bonus = Math.floor(toFill / num * 100) / 100;
                let maxPreAggregatedWidth = 0;
                bbn.fn.each(this.cols, (a, i) => {
                  if ( !a.hidden && (i >= ignore) ){
                    a.realWidth += bonus;
                    if ( isAggregated && (i < aggregatedColIndex) && (a.realWidth >= maxPreAggregatedWidth) ){
                      maxPreAggregatedWidth = a.realWidth;
                      aggregatedColTitle = a;
                    }
                  }
                });
              }
            }
            if ( aggregatedColTitle ){
              aggregatedColTitle.isAggregatedTitle = true;
            }
            let sum = 0;
            bbn.fn.each(groupCols, (a, i) => {
              bbn.fn.each(a.cols, (c) => {
                if ( !c.hidden ){
                  sum += c.realWidth;
                }
              });
              a.width = sum;
              sum = 0;
            });
            bbn.fn.each(groupCols, (a, i) => {
              bbn.fn.each(a.cols, (c) => {
                if ( !c.hidden ){
                  if ( i === 0 ){
                    c.left = sum;
                  }
                  else if ( i === 2 ){
                    c.left = clientWidth - a.width + sum;
                  }
                  sum += c.realWidth;
                }
              });
              sum = 0;
            });
            this.groupCols = groupCols;
            this.colButtons = colButtons;
            this.isAggregated = isAggregated;
            this.aggregatedColumns = aggregatedColumns;
            this.initReady = true;
            if (with_data) {
              this.$nextTick(() => {
                this.$once('dataloaded', () => {
                  this.resizeHeight();
                  this.initStarted = false;
                });
                this.updateData();
              })
            }
            else{
              this.$nextTick(() => {
                this.resizeHeight();
                this.initStarted = false;
              });
            }
          });
        }, 'init', 1000);
      },
      /**
       * Prevents default if enter or tab keys are pressed.
       * @method keydown
       * @param {Event} e
       */
      keydown(e) {
        if (this.isBatch && this.editedRow && (e.which === 9) || (e.which === 13)) {
          e.preventDefault();
        }
      },
      /**
       * Show or hide the given column index.
       * @method show
       * @param {Array} colIndexes
       * @param {Boolean} hide
       * @fires $forceUpdate
       * @fires setConfig
       * @fires init
       */
      show(colIndexes, hide) {
        if (!Array.isArray(colIndexes)) {
          colIndexes = [colIndexes];
        }
        bbn.fn.each(colIndexes, (colIndex) => {
          if (this.cols[colIndex]) {
            if ((this.cols[colIndex].hidden && !hide) || (!this.cols[colIndex].hidden && hide)) {
              let idx = this.currentHidden.indexOf(colIndex);
              if (hide && (idx === -1)) {
                this.currentHidden.push(colIndex);
              } else if (!hide && (idx > -1)) {
                this.currentHidden.splice(idx, 1);
              }
            }
          }
        });
        this.$forceUpdate();
        this.setConfig(true);
        this.init(true);
      },
      /**
       * If no editor is given to the table returns the correct component to edit the field basing on the column type.
       *
       * @method getEditableComponent
       * @param {Object} col
       * @param {Object} data
       * @return {String}
       */
      getEditableComponent(col, data) {
        if (col.editor) {
          return col.editor;
        }
        if (col.type) {
          switch (col.type) {
            case "date":
              return 'bbn-datepicker';
            case "email":
              return 'bbn-input';
            case "url":
              return 'bbn-input';
            case "number":
              return 'bbn-numeric';
            case "money":
              return 'bbn-numeric';
            case "bool":
            case "boolean":
              return 'bbn-checkbox';
          }
        }
        if (col.source) {
          return 'bbn-dropdown';
        }
        return 'bbn-input';
      },
      /**
       * Returns the object of properties to bind with the editable component.
       * @method getEditableOptions
       * @param {Object} col
       * @param {Object} data
       * @returns {Object}
       */
      getEditableOptions(col, data) {
        let res = col.options ? (
          bbn.fn.isFunction(col.options) ? col.options(data, col) : col.options
        ) : {};
        if (!res.name && col.field) {
          res.name = col.field;
        }
        if (col.type) {
          switch (col.type) {
            case "date":
              break;
            case "email":
              bbn.fn.extend(res, {
                type: 'email'
              });
              break;
            case "url":
              bbn.fn.extend(res, {
                type: 'url'
              });
              break;
            case "number":
              break;
            case "money":
              break;
            case "bool":
            case "boolean":
              bbn.fn.extend(res, {
                value: 1,
                novalue: 0
              });
              break;
          }
        }
        if (col.source) {
          bbn.fn.extend(res, {
            source: col.source
          });
        } else if (col.editor) {
          res.source = data;
        }
        return res;
      },
      /**
       * Returns the html element of the given row index.
       * @method getTr
       * @param {Number} i
       * @returns {String}
       */
      getTr(i) {
        let c = this.getRef('table');
        if ( c && c.rows && c.rows[i] ) {
          return c.rows[i];
        }
        return false;
      },
      /**
       * Returns an object of the default values for the different types of fields.
       * @method defaultObject
       * @returns {Object}
       */
      defaultObject() {
        let o = {};
        bbn.fn.iterate(bbn.vue.fieldComponent.props, (v, n) => {
          if (v.default !== undefined) {
            o[n] = bbn.fn.isFunction(v.default) ? v.default() : v.default;
          }
        })
        return o;
      },
      /**
       * Focuses the given row index.
       * @method focusRow
       * @param {Event} ev
       * @param {Number} idx
       */
      focusRow(ev, idx) {
        if (ev.target.tagName !== 'BUTTON') {
          this.focusedRow = idx;
        }
      },
      /**
       * Blurs the given row index.
       * @method blurRow
       * @param {Event} ev
       * @param {Number} idx
       */
      blurRow(ev, idx) {
        if (ev.target.tagName !== 'BUTTON') {
          this.focusedRow = false;
        }
      },
      saveEditedRow() {},
      cancelEditedRow() {},
      /**
       * 
       */
      clickCell() {
        bbn.fn.log("click cell");
      },
      /**
       * Removes the focus from the given row.
       * @param {Number} idx 
       */
      focusout(idx) {
        this.focused = false;
        setTimeout(() => {
          if (!this.focused) {
            this.focusedRow = false;
          }
        }, 50);
      },
      /**
       * Focuses the given row.
       * @param {Number} idx 
       * @param {Event} e 
       */
      focusin(idx, e) {
        if (e.target.tagName !== 'BUTTON') {
          this.focused = true;
          if (this.focusedRow !== idx) {
            this.focusedRow = idx;
          }
        }
      }
    },
    /**
     * Adds bbns-column from the slot and sets the initial configuration of the table.
     * @event created
     * @fires addColumn
     * @fires setConfig
     * @fires getStorage
     */
    created() {
      // Adding bbns-column from the slot
      if (this.$slots.default) {
        let def = this.defaultObject();
        for (let node of this.$slots.default) {
          //bbn.fn.log("TRYING TO ADD COLUMN", node);
          if (
            node.componentOptions &&
            (node.componentOptions.tag === 'bbns-column')
          ) {
            this.addColumn(bbn.fn.extend({}, def, node.componentOptions.propsData));
          }
          else if (
            (node.tag === 'bbns-column') &&
            node.data && node.data.attrs
          ) {
            this.addColumn(bbn.fn.extend({}, def, node.data.attrs));
          }
          else if (node.tag === 'tr') {
            this.hasTrSlot = true
          }
        }
      }
      if (this.columns.length) {
        bbn.fn.each(this.columns, a => this.addColumn(a))
      }

      if (this.defaultConfig.hidden === null) {
        let tmp = [];
        let initColumn = [];
        bbn.fn.each(this.cols, (a, i) => {
          if (a.hidden) {
            tmp.push(i);
          } else if (initColumn.length <= 10) {
            initColumn.push(i);
          }
        });
        this.viewportCols = initColumn;
        this.defaultConfig.hidden = tmp;
      }

      this.setConfig(false, true);
      this.initialConfig = this.jsonConfig;
      this.savedConfig = this.jsonConfig;
      let cfg = this.getStorage();
      if (cfg) {
        this.setConfig(cfg, true);
      }
    },
    /**
     * After the initialization of the component sets the property ready on true.
     * @event mounted
     * @fires init
     * @fires updateData
     */
    mounted() {
      this.container = this.getRef('container');
      this.marginStyleSheet = document.createElement('style');
      document.body.appendChild(this.marginStyleSheet);
      this.isTable = !!this.closest('bbn-table');
      let floater = this.closest('bbn-floater');
      if (floater) {
        floater.$on('ready', () => {
          this.init();
          this.$once('dataloaded', () => {
            this.ready = true;
            floater.onResize();
          });
        });
        this.updateData();
      }
      else{
        this.init();
        this.$once('dataloaded', () => {
          this.ready = true;
        });
        this.updateData();
      }
    },
    watch: {
      /**
       * Updates the data.
       * @watch observerValue
       * @fires updateData
       */
      observerValue(newVal) {
        if ((newVal !== this._observerReceived) && !this.editedRow) {
          this._observerReceived = newVal;
          //bbn.fn.log("watch observerValue");
          this.updateData();
        }
      },
      /**
       * @watch editedRow
       */
      editedRow(newVal, oldVal) {
        if (newVal === false) {
          this.editedIndex = false;
        }
      },
      /**
       * @ignore
       * @watch cols
       * @fires selfEmit
       */
      cols: {
        deep: true,
        handler() {
          //bbn.fn.log("watch columns");
          //this.selfEmit();
        }
      },
      /**
       * Forces the update of the component.
       * @watch currentHidden
       * @fires setConfig
       */
      currentHidden: {
        deep: true,
        handler() {
          if (this.ready) {
            this.setConfig(true);
            this.$forceUpdate();
          }
        }
      },
      /**
       * @watch group
       * @fires init
       */
      group() {
        this.currentExpandedValues = [];
        this.currentExpanded = [];
        this.init();
      },

      /**
       * @watch focusedRow
       * @fires isModified
       * @emit change
       */
      focusedRow(newIndex, oldIndex) {
        if (
          this.editable &&
          (this.editMode === 'inline')
        ) {
          if (this.items[oldIndex] !== undefined) {
            let idx = this.items[oldIndex].index;
            if (
              (this.editedIndex === idx) &&
              this.isModified(idx)
            ) {
              //this.$forceUpdate();
              this.$emit('change', this.items[oldIndex].data, idx);
              //this.save();
            }
          }
          if (this.items[newIndex] && !this.items[newIndex].group) {
            let comeFromAfter = newIndex === oldIndex - 1;
            this.$nextTick(() => {
              this.edit(this.items[newIndex].data, null, newIndex);
              this.$nextTick(() => {
                let nextInputs = this.getTr(newIndex).querySelectorAll('input');
                let nextInput;
                bbn.fn.each(nextInputs, (a) => {
                  if ( a.offsetWidth ){
                    nextInput = a;
                    if (!comeFromAfter) {
                      return false;
                    }
                  }
                });
                if ( nextInput ){
                  nextInput.focus();
                }
              });
            });
          }
        }
      },
      /**
       * @watch initStarted
       * @param v 
       */
      initStarted(v){
        if ( !v ){
          setTimeout(() => {
            let hs = false;
            if ( this.scrollable ){
              let hb = this.getRef('xScroller');
              if (hb && hb.isActive){
                hs = true;
              }
            }
            this.hasHorizontalScroll = hs;
          }, 250);
        }
      }
    }
  });

})(window.bbn, window.Vue);

})(bbn);