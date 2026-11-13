import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';
import FormatMediumDatetimePipe from 'app/shared/date/format-medium-datetime.pipe';
import { CertificateService } from './certificate.service';

import { ICertificate } from 'app/shared/model/certificate.model';

@Component({
    selector: 'jhi-certificate-detail',
    templateUrl: './certificate-detail.component.html',
    imports: [FontAwesomeModule, AlertError, FormatMediumDatetimePipe],
})
export class CertificateDetailComponent implements OnInit {
    protected activatedRoute = inject(ActivatedRoute);
    protected certificateService = inject(CertificateService);

    certificate!: ICertificate;
    // e.g. [{ key: 'Type', value: 'X.509' }, { key: 'Signing Algorithm', value: 'SHA256withRSA' }, ...]
    certificateDetails: { key: string; value: string }[] = [];

    private readonly changeDetector = inject(ChangeDetectorRef);

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ certificate }) => {
            this.certificate = certificate;
            this.loadDetails();
        });
    }

    previousState() {
        window.history.back();
    }

    private loadDetails() {
        this.certificateDetails = [];

        if (!this.certificate?.certificateName || this.certificate.url?.startsWith('P12')) {
            return;
        }

        this.certificateService.getCertificateDetails(this.certificate.certificateName).subscribe({
            next: res => {
                this.certificateDetails = (res.body ?? '')
                    .split(';')
                    .filter(detail => detail.length > 0)
                    .map(detail => {
                        const index = detail.indexOf('=');
                        return index > 0
                            ? { key: detail.substring(0, index), value: detail.substring(index + 1) }
                            : { key: '', value: detail };
                    });
                this.changeDetector.detectChanges();
            },
            error: err => console.error('Could not load certificate details', err),
        });
    }
}
