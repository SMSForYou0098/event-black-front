import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';

const generateQRCodeZip = async ({ bookings, QRGenerator, loader }) => {
    if (!bookings?.length) {
        Swal.fire({
            title: 'Error',
            text: 'No bookings found to generate QR codes',
            icon: 'error'
        });
        return;
    }

    const loadingAlert = Swal.fire({
        title: 'Processing',
        html: `
            <div style="text-align: center;">
                <img src=${loader} style="width: 10rem; display: block; margin: 0 auto;"/>
                <div>Progress: <span id="progress-text">0%</span></div>
                <div class="mt-4" style="width: 100%; border: 1px solid #dddddd4f; border-radius: 10px;">
                    <div class="progress-bar bg-primary progress-bar-striped" 
                         id="progress-bar" 
                         style="width: 0%; height: 10px; border-radius: 4px;">
                    </div>
                </div>
            </div>
        `,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false
    });

    try {
        const zip = new JSZip();
        const total = bookings?.length;
        // Create a container div for QR codes
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        // Convert SVG to PNG using canvas
        const svgToPng = async (svgElement) => {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    canvas.width = 144;
                    canvas.height = 144;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(url);
                        resolve(blob);
                    }, 'image/png');
                };

                img.src = url;
            });
        };

        // Update progress function
        const updateProgress = (completedCount) => {
            const progress = Math.round((completedCount / total) * 100);
            const progressBar = document.querySelector('#progress-bar');
            const progressText = document.querySelector('#progress-text');
            if (progressBar && progressText) {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
            }
        };
        let processedCount = 0;
        // Process batch results
        const batchResults = await Promise.all(
            bookings?.map(async (booking,index) => {
                try {
                    const qrElement = document.createElement('div');
                    container.appendChild(qrElement);

                    const qrRoot = createRoot(qrElement);
                    qrRoot.render(
                        <QRGenerator
                            value={booking?.token}
                            documentId={booking?.id || 'unknown'}
                        />
                    );

                    await new Promise(resolve => setTimeout(resolve, 100));

                    const svgElement = qrElement.querySelector('svg');
                    let pngBlob = null;

                    if (svgElement) {
                        pngBlob = await svgToPng(svgElement);
                    }

                    qrRoot.unmount();
                    container.removeChild(qrElement);

                    processedCount++;
                    updateProgress(processedCount);
                    return {
                        // name: booking?.name,
                        name: index+1,
                        blob: pngBlob
                    };
                } catch (error) {
                    console.error(`Error generating QR code for booking:`, error);
                    return null;
                }
            })
        );
       
        batchResults.forEach((result, i) => {
            if (result && result.blob) {
               zip.file(`${i + 1}.png`, result.blob);
            }
        });

        // Update progress after each batch
        // processedCount += batch.length;
        // updateProgress(processedCount);
        // }

        // Generate and download the zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'qr_codes.zip');

        // Clean up
        document.body.removeChild(container);
        loadingAlert.close();

        // Show success message
        Swal.fire({
            title: 'Success!',
            text: 'QR codes have been generated and downloaded',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error('Error in zip generation:', error);
        loadingAlert.close();

        Swal.fire({
            title: 'Error',
            text: 'Failed to generate QR codes. Please try again.',
            icon: 'error'
        });
    }
};

export default generateQRCodeZip;