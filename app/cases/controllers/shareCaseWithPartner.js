'use strict';
import { getTnCUrl } from '../../shared/TnC';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isObject from 'lodash/isObject';

export default class ShareCaseWithPartner {
    constructor($scope, CaseService, AlertService, CASE_EVENTS, gettextCatalog) {
        'ngInject';

        $scope.CaseService = CaseService;
        $scope.selectedPartners = [];

        this.removeQueryParams = () => {
            const url = window.location.href;
            const x = url.replace(/&?partnerAccountNumber=(\d+)/gi, '');
            const y = x.replace(/&?decision-\d+=\w+/gi, '');
            const z = y.replace(/&ackID=(\d+)/gi, '');
            window.location.replace(z);
        }

        const init = async () => {
            const partnerAccountNumber = get((/partnerAccountNumber=(\d+)/gi).exec(window.location.href.toString()), [1]);
            const decisionAccepted = (/decision-\d+=accepted/gi).exec(window.location.href.toString());
            const ackID = get((/ackID=(\d+)/gi).exec(window.location.href.toString()), [1]);
            if(partnerAccountNumber && decisionAccepted && ackID) {
                var alert = AlertService.addWarningMessage(gettextCatalog.getString(`Sharing Case with ${partnerAccountNumber}`));
                await CaseService.savePartnerCaseAccess(CaseService.kase.case_number, partnerAccountNumber, ackID);
                CaseService.sharingCaseWithPartner = false;
                AlertService.removeAlert(alert);
                this.removeQueryParams();
            }
            await CaseService.populatePartners(CaseService.kase.case_number, CaseService.kase.account_number);
        };

        if (CaseService.caseDataReady) {
            init();
        }
        $scope.$on(CASE_EVENTS.received, () => {
            init();
        });

        $scope.$watch('selectedPartnersInput', (partners) => {
            if(!isEmpty(partners) && isObject(partners)) {
                CaseService.TnCUrl = getTnCUrl(get(partners, [0, 'accountNumber']));
                $scope.selectedPartners = partners;
                $scope.selectedPartnersInput = '';
            }
        })
    }
}
