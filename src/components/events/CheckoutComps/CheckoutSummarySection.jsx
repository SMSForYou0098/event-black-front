import { AnimatePresence } from "framer-motion";
import { BreakdownTable, ETicketAlert, MotionWrapper, PromoCodeSection, SavingsHighlight, TotalAmountHeader } from "./checkout_utils";
import { ANIMATION_VARIANTS } from "../../../utils/consts";
import { motion } from "framer-motion";
export const CheckoutSummarySection = ({
  orderData,
  calculatedTotal,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  isExpanded,
  setIsExpanded
}) => (
  <div className="modern-checkout-summary">
    <ETicketAlert />
    
    <MotionWrapper
      variant="fadeInUp" 
      delay={0.2} 
      className="summary-card border rounded-3 shadow-sm overflow-hidden"
    >
      <PromoCodeSection
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        handleApplyCoupon={handleApplyCoupon}
      />

      <div className="p-4">
        <TotalAmountHeader
          orderData={orderData}
          calculatedTotal={calculatedTotal}
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
              <BreakdownTable orderData={orderData}  calculatedTotal={calculatedTotal}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {orderData?.discount > 0 && (
        <SavingsHighlight totalSavings={orderData.discount} />
      )}
    </MotionWrapper>
  </div>
);