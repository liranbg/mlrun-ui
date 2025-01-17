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
import React, { useEffect, useCallback, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation, useParams } from 'react-router-dom'
import { connect, useDispatch, useSelector } from 'react-redux'
import { createForm } from 'final-form'
import arrayMutators from 'final-form-arrays'
import { Form } from 'react-final-form'
import { isEqual, pickBy } from 'lodash'
import classnames from 'classnames'

import DetailsTabsContent from './DetailsTabsContent/DetailsTabsContent'
import { ConfirmDialog } from 'igz-controls/components'
import Loader from '../../common/Loader/Loader'
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage'
import DetailsHeader from './DetailsHeader/DetailsHeader'
import TabsSlider from '../../common/TabsSlider/TabsSlider'

import { TERTIARY_BUTTON, PRIMARY_BUTTON } from 'igz-controls/constants'
import detailsActions from '../../actions/details'
import {
  ARTIFACTS_PAGE,
  DATASETS,
  FILES_PAGE,
  FUNCTIONS_PAGE,
  JOBS_PAGE,
  MODEL_ENDPOINTS_TAB,
  MODELS_TAB
} from '../../constants'
import { ACTIONS_MENU } from '../../types'
import {
  generateArtifactsContent,
  generateFeatureStoreContent,
  generateFunctionsContent,
  generateJobsContent
} from './details.util'
import { isEveryObjectValueEmpty } from '../../utils/isEveryObjectValueEmpty'
import { useBlockHistory } from '../../hooks/useBlockHistory.hook'
import { showArtifactsPreview } from '../../reducers/artifactsReducer'
import { setFieldState } from 'igz-controls/utils/form.util'

import './details.scss'

const Details = ({
  actionsMenu,
  applyDetailsChanges,
  applyDetailsChangesCallback,
  detailsMenu,
  formInitialValues,
  getCloseDetailsLink,
  handleCancel,
  handleRefresh,
  isDetailsScreen,
  pageData,
  removeInfoContent,
  removeModelFeatureVector,
  resetChanges,
  retryRequest,
  selectedItem,
  setChanges,
  setChangesCounter,
  setChangesData,
  setInfoContent,
  setIteration,
  setIterationOption,
  setFiltersWasHandled,
  showWarning,
  tab
}) => {
  const applyChangesRef = useRef()
  const dispatch = useDispatch()
  const detailsRef = useRef()
  const params = useParams()
  const { blockHistory, unblockHistory } = useBlockHistory()
  const [historyIsBlocked, setHistoryIsBlocked] = useState(false)
  const detailsStore = useSelector(store => store.detailsStore)
  const filtersStore = useSelector(store => store.filtersStore)
  const location = useLocation()

  const detailsPanelClassNames = classnames(
    'table__item',
    detailsStore.showWarning && 'pop-up-dialog-opened',
    isDetailsScreen && 'table__item_big'
  )

  const formRef = React.useRef(
    createForm({
      initialValues: formInitialValues,
      mutators: { ...arrayMutators, setFieldState },
      onSubmit: () => {}
    })
  )

  const handlePreview = useCallback(() => {
    dispatch(
      showArtifactsPreview({
        isPreview: true,
        selectedItem
      })
    )
  }, [dispatch, selectedItem])

  useEffect(() => {
    return () => {
      //TODO
      resetChanges()
      unblockHistory()
    }
  }, [resetChanges, unblockHistory])

  useEffect(() => {
    if (!isEveryObjectValueEmpty(selectedItem)) {
      if (pageData.details.type === JOBS_PAGE) {
        setInfoContent(generateJobsContent(selectedItem))
      } else if (
        pageData.details.type === ARTIFACTS_PAGE ||
        pageData.details.type === FILES_PAGE ||
        pageData.details.type === MODELS_TAB ||
        pageData.details.type === MODEL_ENDPOINTS_TAB ||
        pageData.details.type === DATASETS
      ) {
        setInfoContent(
          generateArtifactsContent(pageData.details.type, selectedItem, params.projectName)
        )
      } else if (pageData.details.type === FUNCTIONS_PAGE) {
        setInfoContent(generateFunctionsContent(selectedItem))
      } else {
        setInfoContent(generateFeatureStoreContent(pageData.details.type, selectedItem))
      }
    }
  }, [pageData.details.type, params.projectName, selectedItem, setInfoContent, location.search])

  useEffect(() => {
    return () => {
      //TODO
      if (pageData.details.type === MODELS_TAB) {
        removeModelFeatureVector()
      }

      removeInfoContent()
      setHistoryIsBlocked(false)
    }
  }, [pageData.details.type, removeInfoContent, removeModelFeatureVector, selectedItem])

  const handleShowWarning = useCallback(
    show => {
      showWarning(show)
    },
    [showWarning]
  )

  const handleRefreshClick = useCallback(
    event => {
      if (
        detailsStore.changes.counter > 0 &&
        document.getElementById('refresh')?.contains(event.target)
      ) {
        handleShowWarning(true)
        setFiltersWasHandled(true)
      }
    },
    [detailsStore.changes.counter, handleShowWarning, setFiltersWasHandled]
  )

  useEffect(() => {
    window.addEventListener('click', handleRefreshClick)

    return () => {
      window.removeEventListener('click', handleRefreshClick)
    }
  }, [handleRefreshClick])

  useEffect(() => {
    if (detailsStore.changes.counter > 0 && !historyIsBlocked) {
      blockHistory(() => handleShowWarning(true))
      setHistoryIsBlocked(true)
    } else if (detailsStore.changes.counter === 0 && historyIsBlocked) {
      unblockHistory()
      setHistoryIsBlocked(false)
    }
  }, [
    blockHistory,
    detailsStore.changes.counter,
    handleShowWarning,
    unblockHistory,
    historyIsBlocked
  ])

  useEffect(() => {
    if (
      formRef.current &&
      detailsStore.changes.counter === 0 &&
      !isEqual(pickBy(formInitialValues), pickBy(formRef.current.getState()?.values))
    ) {
      formRef.current.restart(formInitialValues)
    }
  }, [formInitialValues, detailsStore.changes.counter])

  const detailsMenuClick = useCallback(() => {
    if (historyIsBlocked) {
      unblockHistory()
      setHistoryIsBlocked(false)
    }
  }, [historyIsBlocked, unblockHistory])

  const applyChanges = useCallback(() => {
    applyDetailsChanges(detailsStore.changes).then(() => {
      resetChanges()
      unblockHistory()
      setHistoryIsBlocked(false)
      applyDetailsChangesCallback(detailsStore.changes, selectedItem)
    })
  }, [
    applyDetailsChanges,
    applyDetailsChangesCallback,
    detailsStore.changes,
    resetChanges,
    selectedItem,
    unblockHistory
  ])

  const cancelChanges = useCallback(() => {
    if (detailsStore.changes.counter > 0) {
      resetChanges()
      unblockHistory()
      setHistoryIsBlocked(false)
      formRef.current.reset(formInitialValues)
    }
  }, [detailsStore.changes.counter, formInitialValues, resetChanges, unblockHistory])

  const leavePage = useCallback(() => {
    cancelChanges()
    handleShowWarning(false)

    if (detailsStore.filtersWasHandled) {
      retryRequest(filtersStore)
      setFiltersWasHandled(false)
    } else {
      unblockHistory(true)
    }

    window.dispatchEvent(new CustomEvent('discardChanges'))
  }, [
    cancelChanges,
    detailsStore.filtersWasHandled,
    filtersStore,
    handleShowWarning,
    retryRequest,
    setFiltersWasHandled,
    unblockHistory
  ])

  return (
    <Form form={formRef.current} onSubmit={() => {}}>
      {formState => (
        <div className={detailsPanelClassNames} ref={detailsRef} data-testid="detailsPanel">
          {detailsStore.loading && <Loader />}
          {detailsStore.error && <ErrorMessage message={detailsStore.error.message} />}
          <div className="item-header-wrapper">
            <DetailsHeader
              actionsMenu={actionsMenu}
              applyChanges={applyChanges}
              applyChangesRef={applyChangesRef}
              cancelChanges={cancelChanges}
              getCloseDetailsLink={getCloseDetailsLink}
              isDetailsScreen={isDetailsScreen}
              handleCancel={handleCancel}
              handleRefresh={handleRefresh}
              handleShowWarning={handleShowWarning}
              pageData={pageData}
              selectedItem={selectedItem}
              setIteration={setIteration}
              tab={tab}
            />
            <TabsSlider tabsList={detailsMenu} onClick={detailsMenuClick} initialTab={params.tab} />
          </div>
          <DetailsTabsContent
            applyChangesRef={applyChangesRef}
            formState={formState}
            handlePreview={handlePreview}
            pageData={pageData}
            selectedItem={selectedItem}
            setChanges={setChanges}
            setChangesCounter={setChangesCounter}
            setChangesData={setChangesData}
            setIteration={setIteration}
            setIterationOption={setIterationOption}
          />
          {detailsStore.showWarning && (
            <ConfirmDialog
              cancelButton={{
                handler: () => {
                  handleShowWarning(false)
                  setFiltersWasHandled(false)
                },
                label: detailsStore.filtersWasHandled ? "Don't refresh" : "Don't Leave",
                variant: TERTIARY_BUTTON
              }}
              closePopUp={() => {
                handleShowWarning(false)
                setFiltersWasHandled(false)
              }}
              confirmButton={{
                handler: leavePage,
                label: detailsStore.filtersWasHandled ? 'Refresh' : 'Leave',
                variant: PRIMARY_BUTTON
              }}
              header="You have unsaved changes."
              isOpen={detailsStore.showWarning}
              message={`${
                detailsStore.filtersWasHandled ? 'Refreshing the list' : 'Leaving this page'
              } will discard your changes.`}
            />
          )}
        </div>
      )}
    </Form>
  )
}

Details.defaultProps = {
  applyDetailsChanges: () => {},
  applyDetailsChangesCallback: () => {},
  cancelRequest: () => {},
  formInitialValues: {},
  getCloseDetailsLink: null,
  handleCancel: null,
  handleRefresh: () => {},
  isDetailsScreen: false,
  item: {},
  retryRequest: () => {},
  removeModelFeatureVector: () => {},
  tab: ''
}

Details.propTypes = {
  actionsMenu: ACTIONS_MENU.isRequired,
  applyDetailsChanges: PropTypes.func,
  applyDetailsChangesCallback: PropTypes.func,
  cancelRequest: PropTypes.func,
  detailsMenu: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      hidden: PropTypes.bool
    })
  ).isRequired,
  formInitialValues: PropTypes.object,
  getCloseDetailsLink: PropTypes.func,
  handleCancel: PropTypes.func,
  handleRefresh: PropTypes.func,
  isDetailsScreen: PropTypes.bool,
  pageData: PropTypes.shape({}).isRequired,
  removeModelFeatureVector: PropTypes.func,
  retryRequest: PropTypes.func,
  selectedItem: PropTypes.shape({}).isRequired,
  tab: PropTypes.string
}

export default connect(null, { ...detailsActions })(Details)
