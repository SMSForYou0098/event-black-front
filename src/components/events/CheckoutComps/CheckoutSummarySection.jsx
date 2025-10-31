import { AnimatePresence } from "framer-motion";
import { BreakdownTable, ETicketAlert, MotionWrapper, PromoCodeSection, SavingsHighlight, TotalAmountHeader } from "./checkout_utils";
import { ANIMATION_VARIANTS } from "../../../utils/consts";
import { motion } from "framer-motion";
export const CheckoutSummarySection = ({
  calculatedTotal,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  promoCodeLoading,
  isExpanded,
  setIsExpanded,
  summaryData
}) => {
  return(
  <div className="modern-checkout-summary">
    <ETicketAlert />
    <MotionWrapper
      variant="fadeInUp" 
      delay={0.2} 
      className="custom-dark-bg summary-card border rounded-3 shadow-sm overflow-hidden"
    >
      <PromoCodeSection
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        handleApplyCoupon={handleApplyCoupon}
        promoCodeLoading={promoCodeLoading}
      />

      <div className="p-4">
        <TotalAmountHeader
          summaryData={summaryData}
          // calculatedTotal={calculatedTotal}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="breakdown"
              variants={ANIMATION_VARIANTS.expand}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="mt-3 overflow-hidden"
            >
              <BreakdownTable summaryData={summaryData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {summaryData?.discount > 0 && (
        <SavingsHighlight totalSavings={summaryData?.discount} />
      )}
    </MotionWrapper>
  </div>
);
}