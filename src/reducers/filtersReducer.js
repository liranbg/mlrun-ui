/*
Copyright 2019 Iguazio Systems Ltd.

Licensed under the Apache License, Version 2.0 (the "License") with
an addition restriction as set forth herein. You may not use this
file except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.

In addition, you may not use the software for any purposes that are
illegal under applicable law, and the grant of the foregoing license
under the Apache 2.0 license is conditioned upon your compliance with
such restriction.
*/
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { set } from 'lodash'
import {
  ARTIFACT_OTHER_TYPE,
  DATASET_TYPE,
  DATASETS_FILTERS,
  DATE_FILTER_ANY_TIME,
  FILES_FILTERS,
  FILTER_MENU_MODAL,
  GROUP_BY_NAME,
  MODEL_TYPE,
  MODELS_FILTERS,
  SHOW_ITERATIONS,
  STATE_FILTER_ALL_ITEMS,
  TAG_FILTER_LATEST
} from '../constants'

const initialState = {
  dates: {
    value: DATE_FILTER_ANY_TIME,
    isPredefined: false
  },
  entities: '',
  groupBy: GROUP_BY_NAME,
  iter: SHOW_ITERATIONS,
  labels: '',
  name: '',
  project: '',
  showUntagged: '',
  state: STATE_FILTER_ALL_ITEMS,
  sortBy: '',
  tag: TAG_FILTER_LATEST,
  tagOptions: null,
  projectOptions: [],
  [FILTER_MENU_MODAL]: {
    [DATASETS_FILTERS]: {
      initialValues: { tag: TAG_FILTER_LATEST, labels: '', iter: SHOW_ITERATIONS },
      values: { tag: TAG_FILTER_LATEST, labels: '', iter: SHOW_ITERATIONS }
    },
    [FILES_FILTERS]: {
      initialValues: { tag: TAG_FILTER_LATEST, labels: '', iter: SHOW_ITERATIONS },
      values: { tag: TAG_FILTER_LATEST, labels: '', iter: SHOW_ITERATIONS }
    },
    [MODELS_FILTERS]: {
      initialValues: { tag: TAG_FILTER_LATEST, labels: '', iter: SHOW_ITERATIONS },
      values: { tag: TAG_FILTER_LATEST, labels: '', iter: SHOW_ITERATIONS }
    }
  }
}

export const getFilterTagOptions = createAsyncThunk(
  'getFilterTagOptions',
  ({ dispatch, fetchTags, project, category }) => {
    const fetchTagsArguments = {
      project,
      category
    }
    const fetchTagsPromise =
      [ARTIFACT_OTHER_TYPE, MODEL_TYPE, DATASET_TYPE].includes(category) && dispatch
        ? dispatch(fetchTags(fetchTagsArguments)).unwrap()
        : fetchTags(fetchTagsArguments)

    return fetchTagsPromise.then(({ data }) => {
      return [...new Set(data.tags)].filter(option => option)
    })
  }
)

const filtersSlice = createSlice({
  name: 'filtersStore',
  initialState,
  reducers: {
    removeFilters(state) {
      for (let filterProp in state) {
        state[filterProp] = initialState[filterProp]
      }
    },
    resetModalFilter(state, action) {
      delete state[FILTER_MENU_MODAL][action.payload]
    },
    setFilters(state, action) {
      for (let filterProp in action.payload) {
        state[filterProp] = action.payload[filterProp]
      }
    },
    setModalFiltersValues(state, action) {
      const payloadValue = action.payload.value ?? {}
      const newFilterValues = {
        ...state[FILTER_MENU_MODAL][action.payload.name]?.values,
        ...payloadValue
      }

      set(state, [FILTER_MENU_MODAL, action.payload.name, 'values'], newFilterValues)
    },
    setModalFiltersInitialValues(state, action) {
      const payloadValue = action.payload.value ?? {}
      const newFilterInitialValues = {
        ...state[FILTER_MENU_MODAL][action.payload.name]?.initialValues,
        ...payloadValue
      }

      set(state, [FILTER_MENU_MODAL, action.payload.name, 'initialValues'], newFilterInitialValues)
    },
    setFilterProjectOptions(state, action) {
      state.projectOptions = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(getFilterTagOptions.fulfilled, (state, { payload }) => {
      state.tagOptions = payload
    })
  }
})

export const {
  removeFilters,
  resetModalFilter,
  setFilters,
  setModalFiltersValues,
  setModalFiltersInitialValues,
  setFilterProjectOptions
} = filtersSlice.actions

export default filtersSlice.reducer
