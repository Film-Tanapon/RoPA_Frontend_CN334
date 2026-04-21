import { test, expect } from "@playwright/test";

test.describe("RoPA Records Page Tests", () => {

  test("ทดสอบระบบค้นหากิจกรรม RoPA บนตาราง (ด้วย API Mocking)", async ({ page }) => {
    
    // 1. จำลองข้อมูล (Mock API) ให้ตรงกับที่ page.tsx คาดหวัง
    await page.route("http://localhost:3340/ropa-records", async (route) => {
      const mockData = [
        {
          id: "ROPA-001",
          activity_name: "ระบบรับสมัครพนักงาน",
          data_subject: "ผู้สมัครงาน",
          data_category: "ข้อมูลประวัติส่วนตัว",
          risk_level: "ปานกลาง",
          status: "Active",
          create_date: "2026-01-15T00:00:00Z"
        },
        {
          id: "ROPA-002",
          activity_name: "ระบบจัดเก็บข้อมูลลูกค้า",
          data_subject: "ลูกค้า",
          data_category: "ข้อมูลบัตรเครดิต",
          risk_level: "สูง",
          status: "Inactive",
          create_date: "2026-02-20T00:00:00Z"
        },
      ];
      await route.fulfill({ json: mockData });
    });

    // 2. ไปที่หน้าจัดการ RoPA Records (ปรับ URL ให้ตรงกับโปรเจกต์ของคุณ)
    await page.goto("http://localhost:3000/RoPA_records");

    // 3. ตรวจสอบว่าตารางแสดงข้อมูลทั้งหมดในตอนแรก
    await expect(page.locator("table")).toContainText("ระบบรับสมัครพนักงาน");
    await expect(page.locator("table")).toContainText("ระบบจัดเก็บข้อมูลลูกค้า");

    // 4. ทดสอบการค้นหาผ่าน Input
    // ดักจับ placeholder ให้ตรงกับในไฟล์ page.tsx
    const searchInput = page.getByPlaceholder("ค้นหากิจกรรม, ID หรือหมวดหมู่...");
    await searchInput.fill("ลูกค้า");

    // 5. ตรวจสอบผลลัพธ์หลังการค้นหา
    await expect(page.locator("table")).toContainText("ระบบจัดเก็บข้อมูลลูกค้า");
    await expect(page.locator("table")).not.toContainText("ระบบรับสมัครพนักงาน");
  });

  test("ทดสอบการเลือก Checkbox เพื่อจัดการข้อมูล", async ({ page }) => {
    // จำลองข้อมูล 1 รายการ
    await page.route("http://localhost:3340/ropa-records", async (route) => {
      await route.fulfill({ json: [{
        id: "ROPA-999",
        activity_name: "ระบบทดสอบ",
        risk_level: "ต่ำ"
      }] });
    });

    await page.goto("http://localhost:3000/RoPA_records");
    
    // รอให้ข้อมูลแสดงในตาราง
    await expect(page.locator("table")).toContainText("ระบบทดสอบ");

    // ทดสอบคลิก Checkbox (ตัวแรกใน body ของตาราง)
    const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
    await firstCheckbox.check();

    // ตรวจสอบว่าเมื่อเลือก Checkbox แล้ว แถบเมนู "เลือกแล้ว X รายการ" ปรากฏขึ้น
    await expect(page.getByText("เลือกแล้ว 1 รายการ")).toBeVisible();
    await expect(page.getByRole('button', { name: 'แก้ไข' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ลบที่เลือก' })).toBeVisible();
  });

});